class Routing {
  constructor() {
    this.contextRouting = { base_url: '', prefix: '', host: '', scheme: '' };
  }
  setRoutes = routes => {
    this.routesRouting = routes || [];
  };
  getRoutes = () => this.routesRouting;
  setBaseUrl = baseUrl => {
    this.contextRouting.base_url = baseUrl;
  };
  getBaseUrl = () => this.contextRouting.base_url;
  setPrefix = prefix => {
    this.contextRouting.prefix = prefix;
  };
  setScheme = scheme => {
    this.contextRouting.scheme = scheme;
  };
  getScheme = () => this.contextRouting.scheme;
  setHost = host => {
    this.contextRouting.host = host;
  };
  getHost = () => this.contextRouting.host;

  buildQueryParams = (prefix, params, add) => {
    const self = this;
    const rbracket = new RegExp(/\[]$/);
    if (params instanceof Array) {
      params.forEach((val, i) => {
        if (rbracket.test(prefix)) {
          add(prefix, val);
        } else {
          self.buildQueryParams(
            `${prefix}[${typeof val === 'object' ? i : ''}]`,
            val,
            add
          );
        }
      });
    } else if (typeof params === 'object') {
      Object.keys(params).forEach(name =>
        this.buildQueryParams(`${prefix}[${name}]`, params[name], add)
      );
    } else {
      add(prefix, params);
    }
  };
  getRoute = name => {
    const prefixedName = this.contextRouting.prefix + name;
    if (!this.routesRouting[prefixedName]) {
      if (!this.routesRouting[name]) {
        throw new Error(`The route "${name}" does not exist.`);
      }
    } else {
      return this.routesRouting[prefixedName];
    }
    return this.routesRouting[name];
  };
  generate = (name, optParams, absolute) => {
    const route = this.getRoute(name);
    const params = optParams || {};
    const unusedParams = {...params};
    const schemaVar = '_scheme';
    let url = '';
    let optional = true;
    let host = '';
    (route.tokens || []).forEach(token => {
      if (token[0] === 'text') {
        url = token[1] + url;
        optional = false;
        return;
      }
      if (token[0] === 'variable') {
        const hasDefault = (route.defaults || {})[token[3]];
        if (
          optional === false ||
          !hasDefault ||
          ((params || {})[token[3]] &&
            params[token[3]] !== route.defaults[token[3]])
        ) {
          let value;
          if ((params || {})[token[3]]) {
            value = params[token[3]];
            delete unusedParams[token[3]];
          } else if (hasDefault) {
            value = route.defaults[token[3]];
          } else if (optional) {
            return;
          } else {
            throw new Error(
              `The route "${name}" requires the parameter "${token[3]}".`
            );
          }
          const empty = value === true || value === false || value === '';
          if (!empty || !optional) {
            let encodedValue = encodeURIComponent(value).replace(/%2F/g, '/');
            if (encodedValue === 'null' && value === null) {
              encodedValue = '';
            }
            url = token[1] + encodedValue + url;
          }
          optional = false;
        } else if (hasDefault) {
          delete unusedParams[token[3]];
        }
        return;
      }
      throw new Error(`The token type "${token[0]}" is not supported.`);
    });
    if (url === '') {
      url = '/';
    }
    (route.hosttokens || []).forEach(token => {
      let value;
      if (token[0] === 'text') {
        host = token[1] + host;
        return;
      }
      if (token[0] === 'variable') {
        if ((params || {})[token[3]]) {
          value = params[token[3]];
          delete unusedParams[token[3]];
        } else if (route.defaults[token[3]]) {
          value = route.defaults[token[3]];
        }
        host = token[1] + value + host;
      }
    });
    url = this.contextRouting.base_url + url;
    if (
      route.requirements[schemaVar] &&
      this.getScheme() !== route.requirements[schemaVar]
    ) {
      url = `${route.requirements[schemaVar]}://${host ||
        this.getHost()}${url}`;
    } else if (host && this.getHost() !== host) {
      url = `${this.getScheme()}://${host}${url}`;
    } else if (absolute === true) {
      url = `${this.getScheme()}://${this.getHost()}${url}`;
    }
    if (Object.keys(unusedParams).length > 0) {
      const queryParams = [];
      const add = (key, value) => {
        let newValue = value;
        newValue = typeof newValue === 'function' ? newValue() : newValue;
        newValue = newValue === null ? '' : newValue;
        queryParams.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(newValue)}`
        );
      };
      Object.keys(unusedParams).forEach(prefix =>
        this.buildQueryParams(prefix, unusedParams[prefix], add)
      );
      url = `${url}?${queryParams.join('&').replace(/%20/g, '+')}`;
    }
    return url;
  };

  setData = data => {
    this.setBaseUrl(data.base_url);
    this.setRoutes(data.routes);
    if ('prefix' in data) {
      this.setPrefix(data.prefix);
    }
    this.setHost(data.host);
    this.setScheme(data.scheme);
  };
}
module.exports = new Routing();



