Documentation.js supports customizable themes for HTML output. A theme is a Node.js
module that exports a single function with the following signature:

```
/**
 * @function
 * @param {Array<Object>} comments - an array of comments to be output
 * @param {Object} options - theme options
 * @param {ThemeCallback} callback - see below
 */

/**
 * @callback ThemeCallback
 * @param {?Error} error
 * @param {?Array<vinyl.File>} output
 */
```

The theme function should call the callback with either an error, if one occurs,
or an array of [vinyl](https://github.com/gulpjs/vinyl) `File` objects.

The theme is free to implement HTML generation however it chooses. See
[the default theme](https://github.com/documentationjs/documentation/tree/master/src/default_theme)
for some ideas.

### Customizing the Default Theme

**Instructions**

- Copy contents of `default_theme` folder (noted above) into a new folder in your project.  One way to do it is to create a new git repository with the folder contents and add this line to your `package.json` `devDependencies` section:    `"docjs-theme": "my-gh-username/reponame"`.   That way when you install dependencies, your new theme will be in the projects `node_modules` folder.

- In the folder you created, replace `require('../')` on lines 10 and 11 of `index.js` with `require('documentation')` and save.

- You can now make changes that will show up when you generate your docs using your theme.   Example `package.json` `scripts` entry: `"documentation build index.js -f html -o docs --theme node_modules/docjs-theme"`

### Theming Markdown

The default Markdown generator for documentation.js isn't customizable - instead
of a plain-text theme, it's generated by creating an AST and then rendering
it with [remark](http://remark.js.org/). If you need something extra in Markdown,
you can either rally for that thing to be included in the default theme,
or you can hack around it by using an HTML theme that outputs Markdown.