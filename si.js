
    const lunrData = [
  {
    "id": 0,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Design tokens are the style properties for a design system — these tokens are used for building your design system in Supernova. Design tokens are simple representations of design decisions, that can be easily consumed by the codebases and projects that use your design system.",
    "type": "body"
  },
  {
    "id": 1,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "With Supernova's smart documentation engine, your documentation will be automatically updated from your design system data. ",
    "type": "body"
  },
  {
    "id": 2,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Fill in the following sections with your own design system content.",
    "type": "body"
  },
  {
    "id": 3,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Add a single token to view token data individually.",
    "type": "body"
  },
  {
    "id": 4,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Select from your existing tokens to create a specific list of tokens. ",
    "type": "body"
  },
  {
    "id": 5,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Select from your existing token groups to add a group of tokens. ",
    "type": "body"
  },
  {
    "id": 6,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Add a code block.",
    "type": "body"
  },
  {
    "id": 7,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Token Detail",
    "type": "header"
  },
  {
    "id": 8,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Token List",
    "type": "header"
  },
  {
    "id": 9,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Token Group",
    "type": "header"
  },
  {
    "id": 10,
    "name": "Color",
    "path": "Tokens / Color",
    "url": "/Users/jiritrecak/Documents/Supernova/Development/Exporters/Docs/Main/exporter-documentation/.build/tokens/color.html",
    "text": "Developer Tokens",
    "type": "header"
  }
];
    const lunrIndexedData = {}
    const lunrIndex = lunr(function () {
      this.field('text')
      this.ref('id')
      this.metadataWhitelist = ['position']
    
      // Note index has been loaded into the page with page request
      lunrData.forEach(function (doc) {
        this.add(doc)
        lunrIndexedData[doc.id] = doc
      }, this)
    });
    