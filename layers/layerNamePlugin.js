'use strict';

class LayerName {
  constructor() {
    this.configurationVariablesSources = {
      layerName: {
        async resolve({ params: [{ name, version }] }) {
          return { value: `${name}-${version.replaceAll('.', '_')}` };
        },
      },
    };
  }
}

module.exports = LayerName;