# fos-routing
es6 library for client generate path from symfony2 routing

### Installing

```javascript
npm install fos-routing --save
```

### Usage
To work with Symfony2, you need to generate a js or json file with paths with **fos:js-routing**

```php bin/console fos:js-routing:dump --callback="module.exports = " --target="any_custom_path || web/dist/fos_js_routes_export.js"```

The `--target` parameter is made, for example, it can be any

Then, you should connect the newly created file in fos-routing


```js
// myRouting.js
// import library fos-rouging
import Routing from 'fos-routing';
// import file with routes data
import RoutingData from 'path_to_folder_when_generate_file_with_routing_data || /web/dist/fos_js_routes_export';

// set data
Routing.setData(RoutingData);

// export library
export default Routing;
```

In the main project

```js
// In the main project
import Routing from 'path_to_myRouting.js';

console.log(Routing.generate('demo_path'));
```

### forRouting Methods
| Method | Params | Description
:---|:---|:---
| `setData` | data:Array | Set data |
| `generate` | 1. `routing_name`: String  2.`params`:Object of params | Generate routing by `routing_name` with `params`, return string |


