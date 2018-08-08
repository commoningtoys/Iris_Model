class Behaviour {

    constructor(_type, _agent) {
        this.type = _type;
        this.agent = _agent;
    }

    trade(task) {
        /**
         * curious behaviour
         */
        if (this.agent.preferenceArchive.length > 1) {
            const lastIndex = this.agent.preferenceArchive.length - 1;
            const lastTask = this.agent.preferenceArchive[lastIndex].executed_task;
            console.log(lastTask);
            if(task.type === lastTask){
                // if he does the same task again than he trades
                return true;
            }else{
                return false;
            }
            // noLoop()
        }
        // 
    }

    setType(_type) {
        this.type = _type;
    }
}