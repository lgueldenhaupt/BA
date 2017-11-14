

export class Main {
    start(): void {
    }
}

export function serverTest() {
    console.log("alles okay sagt der server");
}

Meteor.methods({
    serverTest
});