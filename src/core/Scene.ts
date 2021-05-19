
let id = 0;

class Scene {
  gl: WebGL2RenderingContext;
  // program: any;
  objects: any[];
  // transforms: Transforms;

  constructor() {

    this.objects = [];
    // this.transforms = new Transforms(gl);
    this.load = this.load.bind(this);
    this.loadByParts= this.loadByParts.bind(this);
  }

  // Find the item with given alias
  get = (alias) => {
    return this.objects.find(object => object.alias === alias);
  }

  // Asynchronously load a file
  load(filename, alias) {
    return fetch(filename)
    .then(res => res.json())
    .then(object => {
      object.visible = true;
      object.alias = alias || object.alias;
      this.add(object);
    })
    .catch((err) => console.error(err));
  }

  // Helper function for returning as list of items for a given model
  loadByParts(path, count, alias) {
    for (let i = 1; i <= count; i++) {
      const part = `${path}${i}.json`;
      this.load(part, alias);
    }
  }

  // Add object to scene, by settings default and configuring all necessary
  // buffers and textures
  add = (object) => {

    // // Push to our objects list for later access
    object.id = id;
    id++;
    this.objects.push(object);

  }

  // Traverses over every item in the scene
  traverse = (cb) => {
    for(let i = 0; i < this.objects.length; i++) {
      // console.log(this.objects[i])
      // Break out of the loop as long as any value is returned
      if (cb(this.objects[i], i) !== undefined) break;
    }
  }

  // Removes an item from the scene with a given alias
  remove = (alias) => {
    const object = this.get(alias);
    const index = this.objects.indexOf(object);
    this.objects.splice(index, 1);
  }

  // Construct and print a string representing the render order (useful for debugging)
  printRenderOrder() {
    const renderOrder = this.objects.map(object => object.alias).join(' > ');
    console.info('Render Order:', renderOrder);
  }

}

export default Scene;