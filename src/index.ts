import { getForbidden } from '@verdaccio/commons-api';
import {
  AllowAccess,
  AuthAccessCallback,
  AuthCallback,
  IPluginAuth,
  Logger,
  PackageAccess,
  PluginOptions,
  RemoteUser,
} from '@verdaccio/types';

import axios from 'axios';


import { CustomConfig } from '../types/index';

/**
 * Custom Verdaccio Authenticate Plugin.
 */
export default class AuthCustomPlugin implements IPluginAuth<CustomConfig> {
  public logger: Logger;
  public baseURL: string;
  private adminSecret: string;
  private passwords: object = {}

  public constructor(config: CustomConfig, options: PluginOptions<CustomConfig>) {
    this.logger = options.logger;
    this.baseURL = options.config.baseURL;
    this.adminSecret = options.config.adminSecret
    return this;
  }
  /**
   * Authenticate an user.
   * @param user user to log
   * @param password provided password
   * @param cb callback function
   */
  public authenticate(user: string, password: string, cb: AuthCallback): void {
    // FF_BASEURL/account/check/npm/:user
    // Authorization: Bearer :password

    // this.logger.info('authenticate')
    // this.logger.info({user, password: '', url: `${this.baseURL}/account/check/npm/${user}`}, '@{user}, @{password}, @{url}')
    if (user === 'admin' && password === this.adminSecret) {
      this.passwords[user] = [password]
      return cb(null, ['admin'])
    } else {
      axios.get(`${this.baseURL}/account/check/npm/${user}`, {
        headers: {
          Authorization: `Bearer ${password}`,
          "User-Agent": `FlowFuse npm/1.0.0`
        }
      })
      .then(result => {
        if (result.status === 200) {
          this.passwords[user] = [password]
          return cb(null, result.data.teams)
        } else {
          return cb(getForbidden('not allowed'), false)
        }
      })
      .catch(err => {
        this.logger.error(`error: ${err}`)
        return cb(getForbidden('not allowed'), false)
      })
    }
  }

  /**
   * Triggered on each access request
   * @param user
   * @param pkg
   * @param cb
   */
  public allow_access(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void {
    const scopeMatcher = new RegExp('@flowfuse-(.+)/(.+)')
    // console.log('allow_access',user, pkg)
    const teamsList = user.groups.map(t => t.split(':')[0])
    if (user.name) {
      if (user.name === 'admin') {
        this.logger.info({package: (pkg as AllowAccess).name},'admin allowed to access @{package}')
        return cb(null, true)
      }
      if (scopeMatcher.test((pkg as AllowAccess).name)) {
        const scope = scopeMatcher.exec((pkg as AllowAccess).name)
        for (const team of teamsList) {
          if (scope && scope[1] === team) {
            this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} allowed to access @{package}')
            return cb(null, true)
          }
        }
      }
    }
    
    return cb(getForbidden('not allowed'), false)
  }

  /**
   * Triggered on each publish request
   * @param user
   * @param pkg
   * @param cb
   */
  public allow_publish(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void {
    console.log('allow_publish',user, pkg)
    const teamsList = user.groups.map(t => {
      const parts = t.split(':')
      return {
        name: parts[0],
        role: Number.parseInt(parts[1])
      }
    })
    if (user.name) {
      if (user.name === 'admin') {
        this.logger.info({package: (pkg as AllowAccess).name},'admin allowed to publish @{package}')
        return cb(null, true)
      }
      const scopeMatcher = new RegExp('@flowfuse-(.+)/(.+)')
      if (scopeMatcher.test((pkg as AllowAccess).name)) {
        const scope = scopeMatcher.exec((pkg as AllowAccess).name)
        for (const team of teamsList) {
          if (scope && scope[1] === team.name && team.role >= 30 ) {
            this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} allowed to publish @{package}')
            axios.post(`${this.baseURL}/logging/team/${scope[1]}/audit`,
              {
                action: 'publish',
                name: (pkg as AllowAccess).name,
                version: (pkg as AllowAccess).version
              },
              {
              headers: {
                Authorization: `Bearer ${this.passwords[user.name]}`,
                "User-Agent": `FlowFuse npm/1.0.0`
              }
            }).catch(err => {
              // ignore failed log
              console.log(err)
            })
            return cb(null, true)
          }
        }
      }
    }
    this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} not allowed to publish @{package}')
    return cb(getForbidden('not allowed'), false)
  }

  public allow_unpublish(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void {
    console.log('allow_unpublish',user, pkg)
    const teamsList = user.groups.map(t => {
      const parts = t.split(':')
      return {
        name: parts[0],
        role: Number.parseInt(parts[1])
      }
    })
    if (user.name) {
      if (user.name === 'admin') {
        this.logger.info({package: (pkg as AllowAccess).name},'admin allowed to unpublish @{package}')
        return cb(null, true)
      }
      const scopeMatcher = new RegExp('@flowfuse-(.+)/(.+)')
      if (scopeMatcher.test((pkg as AllowAccess).name)) {
        const scope = scopeMatcher.exec((pkg as AllowAccess).name)
        for (const team of teamsList) {
          if (scope && scope[1] === team.name && team.role >= 30 ) {
            this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} allowed to unpublish @{package}')
            // axios.post(`${this.baseURL}/logging/team/${scope[1]}/audit`,
            //   {
            //     action: 'unpublish',
            //     name: (pkg as AllowAccess).name,
            //     version: (pkg as AllowAccess).version
            //   },
            //   {
            //   headers: {
            //     Authorization: `Bearer ${this.passwords[user.name]}`,
            //     "User-Agent": `FlowFuse npm/1.0.0`
            //   }
            // }).catch(err => {
            //   // ignore failed log
            //   console.log(err)
            // })
            return cb(null, true)
          }
        }
      }
    }
    this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} not allowed to unpublish @{package}')
    return cb(getForbidden('not allowed'), false)
  }
}
