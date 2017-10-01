/**
 * Created by mail on 08.12.2016.
 */

import { combinePersonNames } from './util';

class Person {

	constructor(newName) {
		this._name = newName;
	}

	set name(newName) {
		this._name = newName;
	}

	get name() {
		return this._name;
	}

	static shoutOutName(name) {
		console.log(name);
	}
}

function makeIt(nameOne, nameTwo) {
	return combinePersonNames(nameOne, nameTwo);
}

const hans = new Person("Hans");
const sven = new Person("Sven");

Person.shoutOutName(combinePersonNames(hans, sven));