class Loader {
    constructor() {
        this.status = ["Initializing.."];
        this.loaderP = document.getElementById("statusP");
        this.loaderP.innerText = "Status: Initializing..";
    }

    remove(type) {
        this.status = this.status.filter(_s => _s != type)
        if (this.status.length) {
            this.loaderP.innerText = `Status: ${this.status[0]}`;
        } else {
            this.loaderP.innerText = "Status: Ready!";
        }
    }

    add(type) {
        this.status.push(type);
        this.loaderP.innerText = `Status: ${this.status[0]}`;
    }
}

export default Loader;