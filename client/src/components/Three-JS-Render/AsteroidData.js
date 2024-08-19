import { Asteroid } from "./BodyPosition";
import data from "./asteroids.json"
const n2_ = (str) => str.replace(/\s+/g, '_');
const createAsteroids = (lst) => {
    let asts = []; // Move this declaration outside the loop
    for (let i = 0; i < 35000; i++) {
        let data = lst[i];
        asts.push(new Asteroid(
            Number(data.epoch), Number(data.om), Number(data.i), Number(data.w),
            Number(data.a), Number(data.e), Number(data.ma), Number(data.per),
            n2_(data.full_name), 0xf0f0f0, "asteroid.jpg", false, 1, false
        ));
    }
    return asts;
};

export const asteroidData = createAsteroids(data);

