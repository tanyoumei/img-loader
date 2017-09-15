
## intro
### a loader for webpack aim to Compress dependency pictures
## Example

```js
module:{
  rules:[
    {
      test: /\.(png|jpe?g)(\?.*)?$/,
      loader: 'img-loader',
      options: {
        limit: 1500,
        name: 'img/[name].[hash:7].[ext]'
      }
    },
  ]
}

```

## License

  MIT