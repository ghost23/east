/**
 * Created by mail on 08.12.2016.
 */

export const combinePersonNames = (personA, personB) => {
	return `${personA.name}-${personB.name}`;
};

export default function* iterate(myObj) {

	for(let elmt in myObj) {
		if(myObj.hasOwnProperty(elmt) && typeof myObj[elmt] !== "function") yield myObj[elmt];
	}
}
