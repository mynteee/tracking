class Node {
    constructor(x, y, z, r) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
    }
}

function trilaterateLocation(p1, p2, p3, p4) {
    const matrixA = calculateA(p1, p2, p3, p4);
    const vectorB = calculateB(p1, p2, p3, p4);
    return cramerSolve3x3(matrixA, vectorB);
}

function calculateA(p1, p2, p3, p4) {
    return [
        [ 2 * (p2.x - p1.x), 2 * (p2.y - p1.y), 2 * (p2.z - p1.z) ],
        [ 2 * (p3.x - p1.x), 2 * (p3.y - p1.y), 2 * (p3.z - p1.z) ],
        [ 2 * (p4.x - p1.x), 2 * (p4.y - p1.y), 2 * (p4.z - p1.z) ]
    ];
}

function calculateB(p1, p2, p3, p4) {
    const getBValue = (anchor, target) => {
        return (
            Math.pow(anchor.r, 2) - Math.pow(target.r, 2) -
            Math.pow(anchor.x, 2) + Math.pow(target.x, 2) -
            Math.pow(anchor.y, 2) + Math.pow(target.y, 2) -
            Math.pow(anchor.z, 2) + Math.pow(target.z, 2)
        );
    };
    return [getBValue(p1, p2), getBValue(p1, p3), getBValue(p1, p4)];
}

function determinant3x3(m) {
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

function cramerSolve3x3(A, B) {
    const detA = determinant3x3(A);

    if (Math.abs(detA) < 1e-10) {
        throw new Error("The matrix is singular (points are likely coplanar).");
    }
    const Dx = [
        [B[0], A[0][1], A[0][2]],
        [B[1], A[1][1], A[1][2]],
        [B[2], A[2][1], A[2][2]]
    ];
    const Dy = [
        [A[0][0], B[0], A[0][2]],
        [A[1][0], B[1], A[1][2]],
        [A[2][0], B[2], A[2][2]]
    ];
    const Dz = [
        [A[0][0], A[0][1], B[0]],
        [A[1][0], A[1][1], B[1]],
        [A[2][0], A[2][1], B[2]]
    ];
    return [
        determinant3x3(Dx) / detA,
        determinant3x3(Dy) / detA,
        determinant3x3(Dz) / detA
    ];
}

// test case should return 1,1,1
const p1 = new Node(0, 0, 0, Math.sqrt(3));
const p2 = new Node(2, 0, 0, Math.sqrt(3));
const p3 = new Node(0, 2, 0, Math.sqrt(3));
const p4 = new Node(0, 0, 2, Math.sqrt(3));

let location = trilaterateLocation(p1, p2, p3, p4);
console.log(location);