suite('p5.Framebuffer', function() {
  let myp5;

  if (!window.Modernizr.webgl) {
    return;
  }

  setup(function() {
    myp5 = new p5(function(p) {
      p.setup = function() {};
      p.draw = function() {};
    });
  });

  teardown(function() {
    myp5.remove();
  });

  suite('formats and channels', function() {
    function testWithConfiguration(
      version,
      format,
      channels,
      antialias,
      depth
    ) {
      test(
        `framebuffers work with WebGL ${version}, ${format} ${channels} ${depth || 'no'} depth ${antialias ? ' antialiased' : ''}`,
        function() {
          myp5.createCanvas(10, 10, myp5.WEBGL);
          myp5.setAttributes({ version });

          // Draw a box to the framebuffer
          const fbo = myp5.createFramebuffer({
            format,
            channels,
            antialias,
            depth: depth !== null,
            depthFormat: depth
          });
          fbo.draw(() => {
            myp5.background(255);
            myp5.noStroke();
            myp5.fill('red');
            myp5.box(5, 5, 5);
          });

          // Draw the framebuffer to the canvas
          myp5.background(0);
          myp5.noStroke();
          myp5.texture(fbo);
          myp5.plane(myp5.width, -myp5.height);

          // Make sure it drew
          assert.deepEqual(
            myp5.get(0, 0),
            [255, 255, 255, 255]
          );
          assert.deepEqual(
            myp5.get(5, 5),
            [255, 0, 0, 255]
          );
        }
      );
    }

    const versions = [1, 2];
    const formats = ['unsigned-byte', 'float', 'half-float'];
    const channelOptions = ['rgba', 'rgb'];
    const antialiasOptions = [true, false];
    const depthOptions = ['unsigned-int', 'float', null];
    for (const version of versions) {
      for (const format of formats) {
        for (const channels of channelOptions) {
          for (const antialias of antialiasOptions) {
            for (const depth of depthOptions) {
              testWithConfiguration(
                version,
                format,
                channels,
                antialias,
                depth
              );
            }
          }
        }
      }
    }
  });

  suite('sizing', function() {
    test('auto-sized framebuffers change size with their canvas', function() {
      myp5.createCanvas(10, 10, myp5.WEBGL);
      myp5.pixelDensity(1);
      const fbo = myp5.createFramebuffer();
      const oldTexture = fbo.color.rawTexture();
      expect(fbo.width).to.equal(10);
      expect(fbo.height).to.equal(10);
      expect(fbo.density).to.equal(1);

      myp5.resizeCanvas(5, 15);
      myp5.pixelDensity(2);
      expect(fbo.width).to.equal(5);
      expect(fbo.height).to.equal(15);
      expect(fbo.density).to.equal(2);

      // The texture should be recreated
      expect(fbo.color.rawTexture()).not.to.equal(oldTexture);
    });

    test('manually-sized framebuffers do not change size with their canvas', function() {
      myp5.createCanvas(10, 10, myp5.WEBGL);
      myp5.pixelDensity(3);
      const fbo = myp5.createFramebuffer({ width: 20, height: 20, density: 1 });
      const oldTexture = fbo.color.rawTexture();
      expect(fbo.width).to.equal(20);
      expect(fbo.height).to.equal(20);
      expect(fbo.density).to.equal(1);

      myp5.resizeCanvas(5, 15);
      myp5.pixelDensity(2);
      expect(fbo.width).to.equal(20);
      expect(fbo.height).to.equal(20);
      expect(fbo.density).to.equal(1);

      // The texture should not be recreated
      expect(fbo.color.rawTexture()).to.equal(oldTexture);
    });

    suite('resizing', function() {
      let fbo;
      let oldTexture;
      setup(function() {
        myp5.createCanvas(10, 10, myp5.WEBGL);
        myp5.pixelDensity(1);
        fbo = myp5.createFramebuffer();
        oldTexture = fbo.color.rawTexture();

        fbo.resize(5, 15);
        fbo.pixelDensity(2);
      });

      test('framebuffers can be resized', function() {
        expect(fbo.width).to.equal(5);
        expect(fbo.height).to.equal(15);
        expect(fbo.density).to.equal(2);

        // The texture should be recreated
        expect(fbo.color.rawTexture()).not.to.equal(oldTexture);
      });

      test('resizing a framebuffer turns off auto-sizing', function() {
        oldTexture = fbo.color.rawTexture();

        myp5.resizeCanvas(20, 20);
        myp5.pixelDensity(3);

        expect(fbo.width).to.equal(5);
        expect(fbo.height).to.equal(15);
        expect(fbo.density).to.equal(2);

        // The texture should not be recreated
        expect(fbo.color.rawTexture()).to.equal(oldTexture);
      });
    });
  });

  suite('rendering', function() {
    function setupAndReturnFramebuffer() {
      myp5.createCanvas(10, 10, myp5.WEBGL);

      // Draw a box to the framebuffer
      const fbo = myp5.createFramebuffer();
      fbo.draw(() => {
        myp5.background(255);
        myp5.noStroke();
        myp5.fill('red');
        myp5.box(5, 5, 5);
      });

      return fbo;
    }

    test('rendering works with fbo.color as a texture', function() {
      const fbo = setupAndReturnFramebuffer();

      // Draw the framebuffer to the canvas
      myp5.background(0);
      myp5.noStroke();
      myp5.texture(fbo.color);
      myp5.plane(myp5.width, -myp5.height);

      assert.deepEqual(
        myp5.get(5, 5),
        [255, 0, 0, 255]
      );
    });

    test('rendering works with fbo as a texture', function() {
      const fbo = setupAndReturnFramebuffer();

      // Draw the framebuffer to the canvas
      myp5.background(0);
      myp5.noStroke();
      myp5.texture(fbo);
      myp5.plane(myp5.width, -myp5.height);

      assert.deepEqual(
        myp5.get(5, 5),
        [255, 0, 0, 255]
      );
    });

    test('rendering works with fbo.depth as a texture', function() {
      const fbo = setupAndReturnFramebuffer();

      // Draw the framebuffer to the canvas
      myp5.background(0);
      myp5.noStroke();
      myp5.texture(fbo.depth);
      myp5.plane(myp5.width, -myp5.height);

      // Just check the red channel, other channels might vary across browsers
      assert.equal(myp5.get(5, 5)[0], 221);
    });
  });

  test('Framebuffers work on p5.Graphics', function() {
    myp5.createCanvas(10, 10);
    const graphic = myp5.createGraphics(10, 10, myp5.WEBGL);

    // Draw a box to the framebuffer
    const fbo = graphic.createFramebuffer();
    fbo.draw(() => {
      graphic.background(255);
      graphic.noStroke();
      graphic.fill('red');
      graphic.box(5, 5, 5);
    });

    // Draw the framebuffer to the graphic
    graphic.background(0);
    graphic.noStroke();
    graphic.texture(fbo);
    graphic.plane(graphic.width, -graphic.height);

    // Make sure it drew
    assert.deepEqual(
      graphic.get(0, 0),
      [255, 255, 255, 255]
    );
    assert.deepEqual(
      graphic.get(5, 5),
      [255, 0, 0, 255]
    );
  });

  suite('remove()', function() {
    test('remove() cleans up textures', function() {
      myp5.createCanvas(10, 10, myp5.WEBGL);
      const fbo = myp5.createFramebuffer();
      const numTextures = myp5._renderer.textures.size;
      fbo.remove();
      expect(myp5._renderer.textures.size).to.equal(numTextures - 2);
    });

    test(
      'remove() cleans up textures when the framebuffer has no depth',
      function() {
        myp5.createCanvas(10, 10, myp5.WEBGL);
        const fbo = myp5.createFramebuffer({ depth: false });
        const numTextures = myp5._renderer.textures.size;
        fbo.remove();
        expect(myp5._renderer.textures.size).to.equal(numTextures - 1);
      }
    );
  });

  suite('defaultCamera', function() {
    let fbo;
    setup(function() {
      myp5.createCanvas(10, 10, myp5.WEBGL);
      myp5.pixelDensity(1);
      fbo = myp5.createFramebuffer({ width: 5, height: 15 });
    });

    suite('the default camera', function() {
      test('it uses the aspect ratio of the framebuffer', function() {
        expect(fbo.defaultCamera.aspectRatio).to.equal(5 / 15);
        const z = -fbo.height / 2.0 / Math.tan(Math.PI / 3 / 2);
        const expectedCameraMatrix = [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, z, 1
        ];
        for (let i = 0; i < expectedCameraMatrix.length; i++) {
          expect(fbo.defaultCamera.cameraMatrix.mat4[i])
            .to.be.closeTo(expectedCameraMatrix[i], 0.01);
        }
      });

      test('it updates the aspect ratio after resizing', function() {
        fbo.resize(20, 10);
        expect(fbo.defaultCamera.aspectRatio).to.equal(2);

        const z = -fbo.height / 2.0 / Math.tan(Math.PI / 3 / 2);
        const expectedCameraMatrix = [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, z, 1
        ];
        for (let i = 0; i < expectedCameraMatrix.length; i++) {
          expect(fbo.defaultCamera.cameraMatrix.mat4[i])
            .to.be.closeTo(expectedCameraMatrix[i], 0.01);
        }
      });
    });
  });
});
