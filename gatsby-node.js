const path = require('path');
const _ = require('lodash');

exports.onCreateNode = ({ node, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators;
  let slug, template;
  if (node.internal.type === 'MarkdownRemark') {
    if (
      Object.prototype.hasOwnProperty.call(node, 'frontmatter') &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, 'slug')
    ) {
      slug = `/${_.kebabCase(node.frontmatter.slug)}`;
    }
    if (
      Object.prototype.hasOwnProperty.call(node, 'frontmatter') &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, 'title')
    ) {
      slug = `/${_.kebabCase(node.frontmatter.title)}`;
    }
    template = node.frontmatter.template

    createNodeField({ node, name: 'slug', value: slug });
    createNodeField({ node, name: 'template', value: template });
  }
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    // const projectPage = path.resolve('src/templates/project.jsx');
    resolve(
      graphql(`
        {
          projects: allMarkdownRemark {
            edges {
              node {
                fields {
                  slug
                  template
                }
              }
            }
          }
        }
      `).then(result => {
        if (result.errors) {
          /* eslint no-console: "off" */
          console.log(result.errors);
          reject(result.errors);
        }

        result.data.projects.edges.forEach(edge => {
          createPage({
            path: edge.node.fields.slug,
            component: path.resolve(`src/templates/${edge.node.fields.template}.jsx`),
            context: {
              slug: edge.node.fields.slug,
            },
          });
        });
      })
    );
  });
};
