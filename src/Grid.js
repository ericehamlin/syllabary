class Grid {

    constructor(xDim, yDim, zDim, xPosition=-1, yPosition=-1, zPosition=-1) {
        this.xDim = xDim;
        this.yDim = yDim;
        this.zDim = zDim;

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }

        // is this actually 0- or 1- indexed?
        if (xPosition > -1) {
            this.xPosition = xPosition;
        }
        else {
            this.xPosition = getRandomInt(0, xDim);
        }

        if (yPosition > -1) {
            this.yPosition = yPosition;
        }
        else {
            this.yPosition = getRandomInt(0, yDim);
        }

        if (yPosition > -1) {
            this.zPosition = zPosition;
        }
        else {
            this.zPosition = getRandomInt(0, zDim);
        }

        for(x=0; x<xDim; x++) {
            this.syllables[x] = [];

            for(y=0; y<yDim; y++) {
                this.syllables[x][y] = [];

                for(z=0; z<zDim; z++) {
                    this.syllables[x][y][z] = new Syllable(x,y,z);
                }
            }
        }
    }
}