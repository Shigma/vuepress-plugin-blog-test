const { datatypes: { isString } } = require('@vuepress/shared-utils')

const curryHandler = (permalink) => {
  return function (key, pageKey) {
    if (!key) return
    if (!this.data[key]) {
      this.data[key] = {}
      this.data[key].path = permalink.replace(':key', key)
      this.data[key].pageKeys = []
    }
    this.data[key].pageKeys.push(pageKey)
  }
}

module.exports.createTagAddon = ({
  title = 'Tags',
  indexUrl = '/tag/',
  itemUrl = '/tag/:key.html',
  indexFrontmatter = {},
  itemFrontmatter = {},
}) => ({
  name: 'tags',
  data: {},
  handleTag: curryHandler(itemUrl),
  handlePage ({ key, relativePath, frontmatter: { tag, tags } }) {
    if (!relativePath) return
    if (isString(tag)) {
      this.handleTag(tag, key)
    }
    if (Array.isArray(tags)) {
      tags.forEach(tag => this.handleTag(tag, key))
    }
  },
  extraPages () {
    const pages = Object.keys(this.data).map(tagName => ({
      permalink: this.data[tagName].path,
      frontmatter: { title: tagName, ...itemFrontmatter },
      meta: { tagName },
    }))
    pages.push({
      permalink: indexUrl,
      frontmatter: { title, ...indexFrontmatter },
    })
    return pages
  },
})

module.exports.createCategoryAddon = ({
  title = 'Categories',
  indexUrl = '/category/',
  itemUrl = '/category/:key.html',
  indexFrontmatter = {},
  itemFrontmatter = {},
}) => ({
  name: 'categories',
  data: {},
  handleCategory: curryHandler(itemUrl),
  handlePage ({ key, relativePath, frontmatter: { category } }) {
    if (!relativePath) return
    if (isString(category)) {
      this.handleCategory(category, key)
    }
  },
  extraPages () {
    const pages = Object.keys(this.data).map(categoryName => ({
      permalink: this.data[categoryName].path,
      frontmatter: { title: categoryName, ...itemFrontmatter },
      meta: { categoryName },
    }))
    pages.push({
      permalink: indexUrl,
      frontmatter: { title, ...indexFrontmatter },
    })
    return pages
  },
})

module.exports.createDraftAddon = ({
  title = 'Drafts',
  path = '/drafts/',
  frontmatter = {},
}) => ({
  name: 'drafts',
  data: [],
  handlePage ({ key, relativePath, frontmatter: { draft } }) {
    if (!relativePath) return
    if (draft === true) {
      this.data.push(key)
    }
  },
  extraPages () {
    return {
      permalink: path,
      frontmatter: { title, ...frontmatter },
    }
  },
})

module.exports.createMultiAuthorAddon = ({
  title = 'Authors',
  indexUrl = '/author/',
  itemUrl = '/author/:key.html',
  indexFrontmatter = {},
  itemFrontmatter = {},
}) => ({
  name: 'authors',
  data: {},
  handleAuthor (key, pageKey, prop) {
    if (!key) return
    if (!this.data[key]) {
      this.data[key] = {}
      this.data[key].path = itemUrl.replace(':key', key)
      this.data[key].pageKeys = {
        authored: [],
        contributed: [],
      }
    }
    this.data[key].pageKeys[prop].push(pageKey)
  },
  handlePage ({ key, relativePath, frontmatter: { author, contributors } }) {
    if (!relativePath) return
    if (isString(author)) {
      this.handleAuthor(author, key, 'authored')
    }
    if (Array.isArray(contributors)) {
      contributors.forEach(contributor => this.handleAuthor(contributor, key, 'contributed'))
    }
  },
  extraPages () {
    const pages = Object.keys(this.data).map(authorName => ({
      permalink: this.data[authorName].path,
      frontmatter: { title: authorName, ...itemFrontmatter },
      meta: { authorName },
    }))
    pages.push({
      permalink: indexUrl,
      frontmatter: { title, ...indexFrontmatter },
    })
    return pages
  },
})

module.exports.createTimelineAddon = ({
  title = 'Timeline',
  getTime = date => date.getFullYear(),
  indexUrl = '/timeline/',
  itemUrl = '/timeline/:time.html',
  indexFrontmatter = {},
  itemFrontmatter = {},
}) => ({
  name: 'timeline',
  data: {},
  handleTime (key, pageKey) {
    if (!key) return
    if (!this.data[key]) {
      this.data[key] = {}
      this.data[key].path = itemUrl.replace(':time', key)
      this.data[key].pageKeys = []
    }
    this.data[key].pageKeys.push(pageKey)
  },
  handlePage ({ key, relativePath, frontmatter: { createdAt } }) {
    if (!createdAt || !relativePath) return
    this.handleTime(getTime(new Date(createdAt)), key)
  },
  extraPages () {
    const pages = Object.keys(this.data).map(time => ({
      permalink: this.data[time].path,
      frontmatter: { title: time, ...itemFrontmatter },
      meta: { time },
    }))
    pages.push({
      permalink: indexUrl,
      frontmatter: { title, ...indexFrontmatter },
    })
    return pages
  },
})
