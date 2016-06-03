示例一:

```json
{
  "filters": {
    "^/": "nokit-filter-proxy"
  },
  "proxy": {
    "rules": {
      "^/jser": "https://jser.cc"
    }
  }
}
```

示例二:

不保留 URL 中的 /jser 前缀
```json
{
  "filters": {
    "^/": "nokit-filter-proxy"
  },
  "proxy": {
    "rules": {
      "^/jser(.*)": "https://jser.cc"
    }
  }
}
```