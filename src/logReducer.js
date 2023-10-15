function logReducer(state, action) {
    switch (action.type) {
        case 'add': {
            let date = new Date();
            return [{text: action.text, time: [date.getHours(), date.getMinutes(), date.getSeconds()]}, ...state];
        }
        default: {
            throw Error(`Unknown action: ${action.type}`);
        }
    }
}
export default logReducer;