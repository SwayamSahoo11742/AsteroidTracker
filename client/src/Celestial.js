// Helper conversion functions as js Math.cos and Math.sin functions are in rads

function radians(degrees)
{
return degrees * (Math.PI/180);
}

function degrees(radians)
{
return radians * (180/Math.PI);
}


// Parent object for all celestial bodies (asteroids, planets, stars, comets, etc...)
export class Celestial {
    // RAAN: Righ Ascention of the Ascending Node / Longitude of Phe Ascending Node
    // I: Inclination
    // AOP: Argument of Perihelion / Longitude of Perihelion
    // A: Semi-Major Axis / Mean Distance
    // E: Eccentricity
    // M: Mean Anomaly

    // Phe numbers following the variable names denote the following:
    // 1: Initial value
    // 2: Change rate

    constructor(RAAN1 = 0, RAAN2 = 0, I1 = 0, I2 = 0, AOP1 = 0, AOP2 = 0, A1 = 0, A2 = 0, E01 = 0, E02 = 0, M1 = 0, M2 = 0, color = 0xffffff, mesh, orbit=false, radius=5) {
        this.RAAN1 = RAAN1;
        this.RAAN2 = RAAN2;
        this.I1 = I1;
        this.I2 = I2;
        this.AOP1 = AOP1;
        this.AOP2 = AOP2;
        this.A1 = A1;
        this.A2 = A2;
        this.E01 = E01;
        this.E02 = E02;
        this.M1 = M1;
        this.M2 = M2;

        this.orbit = orbit;
        this.color = color;
        this.mesh = mesh;
        this.radius = radius
    }

    // Normalizing degreens to (0,360)
    rev(degree) {
        return degree % 360;
    }

    // Following functions apply the rate of change to the initial value 
    RAAN(d) {
        return this.rev(this.RAAN1 + this.RAAN2 * d);
    }

    i(d) {
        return this.rev(this.I1 + this.I2 * d);
    }

    AOP(d) {
        return this.rev(this.AOP1 + this.AOP2 * d);
    }

    a(d) {
        return this.A1 + this.A2 * d;
    }

    e(d) {
        return this.rev(this.E01 + this.E02 * d);
    }

    M(d) {
        return this.rev(this.M1 + this.M2 * d);
    }

    P(d) {
        const m = 0;  // mass of planet in solar masses
        return 365.256898326 * Math.pow(this.a(d), 1.5) / Math.sqrt(1 + m);
    }

    n() {
        return 360 / this.P();
    }

    // Solves Keplers Second Law equation to get the eccentric anomaly using the iterative method
    E(M, e) {
        let E0 = M + (180.0 / Math.PI) * e * Math.sin(M * Math.PI / 180) * (1 + e * Math.cos(M * Math.PI / 180));
        let d = 1;
        while (d > 0.005) {
            const E1 = E0 - (E0 - (180.0 / Math.PI) * e * Math.sin(E0 * Math.PI / 180) - M) / (1 - e * Math.cos(E0 * Math.PI / 180));
            d = Math.abs(E0 - E1);
            E0 = E1;
        }
        return E0;
    }
    // Coordinates in heliocentric ecliptic rectangular coordinates
    coordinates(d) {
        const M = this.M(d);
        const e = this.e(d);
        const E = this.E(M, e);
        const a = this.a(d);
        const i = this.i(d);
        const RAAN = this.RAAN(d);
        const AOP = this.AOP(d);

        const x = a * (Math.cos(radians(E)) - e);
        const y = a * Math.sqrt(1 - e * e) * Math.sin(radians(E));

        const r = Math.sqrt(x * x + y * y);
        const v = this.rev(degrees(Math.atan2(y, x)));
        const v_r = radians(v); // radians

        const v_plus_AOP_rad = v_r + radians(AOP); // radians
        const RAAN_rad = radians(RAAN);
        const i_rad = radians(i);

        const xeclip = r * (Math.cos(RAAN_rad) * Math.cos(v_plus_AOP_rad) - Math.sin(RAAN_rad) * Math.sin(v_plus_AOP_rad) * Math.cos(i_rad));
        const yeclip = r * (Math.sin(RAAN_rad) * Math.cos(v_plus_AOP_rad) + Math.cos(RAAN_rad) * Math.sin(v_plus_AOP_rad) * Math.cos(i_rad));
        const zeclip = r * Math.sin(v_plus_AOP_rad) * Math.sin(i_rad);
        return {xeclip, yeclip, zeclip};
    }
}

// Child class for asteroids/minor planets
export class Asteroid extends Celestial {
    // epochJD : Epoch in Julian date
    // Mx : Mean anomaly at the time of epoch
    constructor(epochJD, RAANx, i, AOP, a, e, Mx, P, full_name, color, mesh,orbit, radius) {
        const day = epochJD - 2451543.5; 
        const Mc = 360.0 / P; // Mean motion
        const M0 = (Mx - Mc * day) % 360; // Mean anomalh
        super(RAANx, 0.0, i, 0.0, AOP, 0, a, 0, e, 0, M0, Mc, color, mesh, orbit, radius);
        this.full_name = full_name;
        this.distance = 9999999;
    }
    }

export class Earth{
    // Convert days since J2000.0 to Julian Date
    constructor(){
        this.color = 0x1fb0e0;
        this.mesh = "Earth.jpg"
        this.orbit = true;
        this.radius = 1;
    }
    P(){
        return 365.256898326;
    }
    coordinates(d) {
    // Correct by subtracting 1.5 days as it computes with its epoch 1.5 days ahead 
    d -= 1.5;
    const P = d / 36525.0;

    // Sun's mean longitude, in degrees
    const L0 = 280.46645 + (36000.76983 * P) + (0.0003032 * P * P);

    // Sun's mean anomaly, in degrees
    const M0 = 357.52910 + (35999.05030 * P) - (0.0001559 * P * P) - (0.00000048 * P * P * P);

    // Sun's equation of center in degrees
    const C = (1.914600 - 0.004817 * P - 0.000014 * P * P) * Math.sin(radians(M0)) +
                (0.01993 - 0.000101 * P) * Math.sin(radians(2 * M0)) +
                0.000290 * Math.sin(radians(3 * M0));

    // True ecliptical longitude of Sun
    const LS = L0 + C;

    // The eccentricity of the Earth's orbit.
    const e = 0.016708617 - P * (0.000042037 + (0.0000001236 * P));

    // Distance from Sun to Earth in astronomical units (AU)
    const distanceInAU = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(radians(M0 + C)));
    const x = -distanceInAU * Math.cos(radians(LS));
    const y = -distanceInAU * Math.sin(radians(LS));
    // The Earth's center is always on the plane of the ecliptic (z=0)
    return {xeclip: x, yeclip: y, zeclip: 0 };
}

}

