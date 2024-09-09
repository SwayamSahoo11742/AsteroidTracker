import { Asteroid } from "./BodyPosition";
import data_asteroid from "./asteroids.json";
import data_comet from "./comets.json";
import data_pha from "./phas.json"

const n2_ = (str) => str.replace(/\s+/g, ' ');

const createAsteroids = (lst, comets, phas) => {
    let asts = [];
    let pha = [];
    let cometData = [];


    for (let i = 0; i < 35469; i++) {
        let data_asteroid = lst[i];
        asts.push(new Asteroid(
            Number(data_asteroid.epoch), Number(data_asteroid.om), Number(data_asteroid.i), Number(data_asteroid.w),
            Number(data_asteroid.a), Number(data_asteroid.e), Number(data_asteroid.ma), Number(data_asteroid.per),
            n2_(data_asteroid.full_name), 0xf0f0f0, "asteroid.jpg", false, 1, false
        ));

    }

    for(let i = 0; i < 2440; i++){
        let data_pha = phas[i];
        pha.push(new Asteroid(
            Number(data_pha.epoch), Number(data_pha.om), Number(data_pha.i), Number(data_pha.w),
            Number(data_pha.a), Number(data_pha.e), Number(data_pha.ma), Number(data_pha.per),
            n2_(data_pha.full_name), 0xf0f0f0, "asteroid.jpg", false, 1, false
        ));
    }

    for(let i = 0; i < 205; i++){
        let data_comet = comets[i];
        cometData.push(new Asteroid(
            Number(data_comet.epoch), Number(data_comet.om), Number(data_comet.i), Number(data_comet.w),
            Number(data_comet.a), Number(data_comet.e), Number(data_comet.ma), Number(data_comet.per),
            n2_(data_comet.full_name), 0xf0f0f0, "asteroid.jpg", false, 1, false
        ));
    }
    console.log(phas)


    return { asts, pha, cometData };
};

export const { asts: asteroidData, pha, cometData } = createAsteroids(data_asteroid, data_comet, data_pha);

