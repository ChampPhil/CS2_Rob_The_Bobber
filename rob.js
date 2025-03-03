class Bob {
    constructor(color, direction) {
      this.direction = this.direction
      this.color = color
      this.speed = this.speed
    }
    show() {
      fill(255, 255, 0);
      stroke(0);
      ellipse(this.loc.x, this.loc.y, this.radius*2);
    }
    move() {
      if (this.vel.x > -1 && this.vel.x < 1)
        this.vel.x = 1;
      if (this.loc.y <= this.radius) this.vel.y *= -1;
  
      if (this.loc.x <= this.radius || this.loc.x >= width - this.radius)
        this.vel.x *= -1;
      this.loc.add(this.vel);
    }
    bounce() {
      this.vel.y *= -1;
    }
  
    update() {
      this.move();
      this.show();
    }
}