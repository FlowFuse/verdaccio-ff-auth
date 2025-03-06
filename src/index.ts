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

    this.logger.info('authenticate')
    this.logger.info({user, password: '', url: `${this.baseURL}/account/check/npm/${user}`}, '@{user}, @{password}, @{url}')
    if (user === 'admin' && password === this.adminSecret) {
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
          const groups = [user]
          if (result.data?.write) {
            groups.push('write')
          }
          return cb(null, groups)
        } else {
          return cb(getForbidden('not allowed'), false)
        }
      })
      .catch(err => {
        // console.log(`error: ${err}`)
        this.logger.error({err}, '@{err.toString()}')
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
    /**
     * This code is just an example for demostration purpose
    if (user.name === this.foo && pkg?.access?.includes[user.name]) {
      this.logger.debug({name: user.name}, 'your package has been granted for @{name}');
      cb(null, true)
    } else {
      this.logger.error({name: user.name}, '@{name} is not allowed to access this package');
       cb(getInternalError("error, try again"), false);
    }
     */
    const scopeMatcher = new RegExp('@flowfuse-(.+)/(.+)')
    // console.log('allow_access',user, pkg)
    if (user.name) {
      if (user.name === 'admin') {
        this.logger.info({package: (pkg as AllowAccess).name},'admin allowed to access @{package}')
        return cb(null, true)
      }
      if (scopeMatcher.test((pkg as AllowAccess).name)) {
        const scope = scopeMatcher.exec((pkg as AllowAccess).name)
        if (scope && scope[1] === (user.name as string).split('@')[1]) {
          this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} allowed to access @{package}')
          return cb(null, true)
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
    /**
     * This code is just an example for demostration purpose
    if (user.name === this.foo && pkg?.access?.includes[user.name]) {
      this.logger.debug({name: user.name}, '@{name} has been granted to publish');
      cb(null, true)
    } else {
      this.logger.error({name: user.name}, '@{name} is not allowed to publish this package');
       cb(getInternalError("error, try again"), false);
    }
     */
    // console.log('allow_publish',user, pkg)
    if (user.name) {
      if (user.name === 'admin') {
        this.logger.info({package: (pkg as AllowAccess).name},'admin allowed to publish @{package}')
        return cb(null, true)
      }
      const scopeMatcher = new RegExp('@flowfuse-(.+)/(.+)')
      if (scopeMatcher.test((pkg as AllowAccess).name)) {
        const scope = scopeMatcher.exec((pkg as AllowAccess).name)
        if (scope && scope[1] === (user.name as string).split('@')[1]) {
          this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} allowed to publish @{package}')
          return cb(null, true)
        }
      }
    }
    this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} not allowed to publish @{package}')
    return cb(getForbidden('not allowed'), false)
  }

  public allow_unpublish(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void {
    /**
     * This code is just an example for demostration purpose
    if (user.name === this.foo && pkg?.access?.includes[user.name]) {
      this.logger.debug({name: user.name}, '@{name} has been granted to unpublish');
      cb(null, true)
    } else {
      this.logger.error({name: user.name}, '@{name} is not allowed to publish this package');
      cb(getInternalError("error, try again"), false);
    }
     */
    // console.log('allow_unpublish',user, pkg)
    if (user.name) {
      if (user.name === 'admin') {
        this.logger.info({package: (pkg as AllowAccess).name},'admin allowed to unpublish @{package}')
        return cb(null, true)
      }
      const scopeMatcher = new RegExp('@flowfuse-(.+)/(.+)')
      if (scopeMatcher.test((pkg as AllowAccess).name)) {
        const scope = scopeMatcher.exec((pkg as AllowAccess).name)
        if (scope && scope[1] === (user.name as string).split('@')[1]) {
          this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} allowed to unpublish @{package}')
          return cb(null, true)
        }
      }
    }
    this.logger.info({name: user.name, package: (pkg as AllowAccess).name},'@{name} not allowed to unpublish @{package}')
    return cb(getForbidden('not allowed'), false)
  }
}
