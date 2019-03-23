const stringify = require('@shigma/stringify-object')
const { resolve } = require('path')
const officialAddons = require('./addons')

module.exports = (options, context) => {
  const {
    directories = [],
    pageEnhancers = [],
    tags = {},
    categories = {},
    multiauthor,
    drafts = {},
    timeline = {},
  } = options

  const addons = []
  const enhancers = []

  for (const directory of directories) {
    let { dirname = '', frontmatter } = directory

    if (dirname) dirname += '/'

    enhancers.push({
      when: ({ relativePath }) => relativePath && relativePath.startsWith(dirname),
      frontmatter,
    })
  }

  enhancers.push(...pageEnhancers)

  if (tags) addons.push(officialAddons.createTagAddon(tags))
  if (categories) addons.push(officialAddons.createCategoryAddon(categories))
  if (drafts) addons.push(officialAddons.createDraftAddon(drafts))
  if (timeline) addons.push(officialAddons.createTimelineAddon(timeline))
  if (multiauthor) {
    const options = typeof multiauthor === 'object' ? multiauthor : {}
    addons.push(officialAddons.createMultiAuthorAddon(options))
  }

  addons.push(...(options.addons || []))

  return {
    name: '@vuepress/plugin-blog',

    extendPageData (page) {
      enhancers.forEach(({ when, frontmatter }) => {
        if (!when(page)) return
        page.frontmatter = {
          ...frontmatter,
          ...page.frontmatter,
        }
      })
    },

    async ready () {
      context.pages.forEach((page) => {
        addons.forEach((addon) => {
          addon.handlePage(page)
        })
      })

      await Promise.all([].concat(...addons.map((addon) => {
        return typeof addon.extraPages === 'function'
          ? addon.extraPages()
          : []
      })).map(page => context.addPage(page)))
    },

    async clientDynamicModules () {
      return addons.map((addon) => {
        const data = typeof addon.clientModule === 'function'
          ? addon.clientModule()
          : addon.clientModule || addon.data
        return {
          name: `${addon.name}.js`,
          content: `export default ${stringify(data)}`,
        }
      })
    },

    enhanceAppFiles: resolve(__dirname, 'enhanceApp.js'),
  }
}
