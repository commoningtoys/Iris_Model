class Memory {
  constructor(memory) {
    // console.log(memory);
    this.memory = {};
    // make memory blueprint
    Object.keys(memory).forEach(key => {
      const data = memory[key];
      if (typeof data === 'number' || typeof data === 'boolean') {
        this.memory[key] = [];
      } else if (key === 'preferences') {
        Object.keys(data).forEach(task => {
          const preferences = data[task];
          Object.keys(preferences).forEach(inner_key => {
            const inner_el = preferences[inner_key];
            if (typeof inner_el === 'number' && inner_key !== 'completed' && inner_key !== 'forget_rate') {
              this.memory[task + '_' + inner_key] = [];
            }
          })
        })
      } else {
        this.memory[key] = [];
      }
    })
    console.log(this.memory);
  }

  add_memory(memory) {
    Object.keys(memory).forEach(key => {
      const data = memory[key];
      if (key === 'preferences') {
        Object.keys(data).forEach(task => {
          const preferences = data[task];
          Object.keys(preferences).forEach(inner_key => {
            const index = this.get_index(task + '_' + inner_key);
            const inner_el = preferences[inner_key];
            if(index !== null)this.memory[index].push(inner_el)
          })
        })
      } else {
        const index = this.get_index(key);
        if(index !== null)this.memory[index].push(data);

      }
    })
  }
  get_index(key) {
    let index = null;
    Object.keys(this.memory).forEach(item =>{
      if (item === key) {
        index = key;
      }
    })
    return index;
  }
  get_memories() {
    return this.memory;
  }
}