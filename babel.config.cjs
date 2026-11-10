// Jest dialog integration only — JSX transform; keep on Babel 7.x to match workbox/vite graphs.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
}
