class StateMachine {
    constructor(sketch) {
        this.s = sketch

        this.state = {
            status: ':READY:',
            step: 0,
        }
    }

    setStatus(status) {
        this.state.status = status
    }

    nextStep() {
        this.state.step++
    }
}

export default StateMachine
