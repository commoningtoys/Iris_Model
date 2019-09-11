class Memory {
  constructor(memory) {
    this.memory = [];
    // Object.keys(memory).forEach(key => {
    //   const data = memory[key];
    //   if (typeof data === 'number' || typeof data === 'boolean') {
    //     this.memory[key] = data;
    //   } else if (key === 'preferences') {
    //     Object.keys(data).forEach(task => {
    //       const preferences = data[task];
    //       Object.keys(preferences).forEach(inner_key => {
    //         const inner_el = preferences[inner_key];
    //         if (typeof inner_el === 'number') {
    //           this.memory[task + '_' + inner_key] = data;
    //         } else if (typeof inner_el === 'string') {
    //           this.memory[task + '_' + inner_key] = data;
    //         }
    //       })
    //     })
    //   } else {
    //     this.memory[key] = data;
    //   }
    // })
  }

  add_memory(memory) {
    const tmp = {}
    Object.keys(memory).forEach(key => {
      const data = memory[key];
      if (typeof data === 'number' || typeof data === 'boolean') {
        tmp[key] = data;
      } else if (key === 'preferences') {
        Object.keys(data).forEach(task => {
          const preferences = data[task];
          Object.keys(preferences).forEach(inner_key => {
            const inner_el = preferences[inner_key];
            if (typeof inner_el === 'number' && inner_key !== 'completed') { // we don't need to know how often a atsk has been completed here
              tmp[task + '_' + inner_key] = inner_el;
            } else if (typeof inner_el === 'string') {
              tmp[task + '_' + inner_key] = inner_el;
            }
          })
        })
      } else {
        tmp[key] = data;
      }
    })
    this.memory.push(tmp);
  }
  get_memories(){
    return this.memory;
  }
}