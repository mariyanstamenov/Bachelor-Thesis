import { apis, percentColors } from '../utils/configs';
import { calculatePillarColor } from '../utils/functions';

class Legend {
    constructor() {
        this.legend = document.getElementById("legend");
    }

    setParams(apiIndex, sortByIndex, colorByIndex) {
        this.apiIndex = apiIndex;
        this.legend.innerHTML = "<h2>Legend</h2>";

        if (apis[apiIndex].type == "point") {
            for (let index = 0; index < percentColors.length; index++) {
                const item = percentColors[index];
                if (colorByIndex == "walkscore" && parseInt(item.pct) >= 1.0) {
                    break;
                }

                let label = "";
                let gradient = "";
                if (index + 1 < percentColors.length) {
                    label = `${parseInt(item.pct * 100)} - ${parseInt(percentColors[index + 1].pct * 100)}`;
                    gradient = `linear-gradient(90deg, ${calculatePillarColor(percentColors, percentColors[index].pct)} 0%, ${calculatePillarColor(percentColors, percentColors[index + 1].pct)} 100%)`;
                } else {
                    label = `${parseInt(item.pct * 100)}+`;
                    gradient = `linear-gradient(90deg, ${calculatePillarColor(percentColors, percentColors[index].pct)} 0%, ${calculatePillarColor(percentColors, percentColors[index].pct)} 100%)`;
                }

                const div = document.createElement("div");
                div.classList.add("entity");
                div.classList.add("searchPercValue");
                div.setAttribute("data-perc-value", label);
                const color = document.createElement("div");
                color.classList.add("color");
                color.style.background = gradient;
                const value = document.createElement("p");
                value.classList.add("value");
                value.innerText = `${label}`;

                div.appendChild(color);
                div.appendChild(value);
                this.legend.appendChild(div);
            }
        }
    }

    setHint(apiIndex, selectedElement, colorByIndex) {
        this.clearHints();

        if (apis[apiIndex].type == "point") {
            const value = selectedElement.userData.info.point[colorByIndex];
            Object.values(document.getElementsByClassName("searchPercValue")).forEach(element => {
                const elValue = element.getAttribute("data-perc-value").split(" - ");
                const nextValue = isNaN(parseInt(elValue[1])) ? Number.MAX_VALUE : parseInt(elValue[1]);
                if (nextValue > value && parseInt(elValue[0]) <= value) {
                    element.classList.add("hint");
                }
            });
        }
    }

    clearHints() {
        Object.values(document.getElementsByClassName("searchPercValue")).forEach(element => {
            element.classList.remove("hint");
        });
    }
};

export default Legend;