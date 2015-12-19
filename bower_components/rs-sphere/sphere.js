// Generated by CoffeeScript 1.9.3
(function() {
  var endsWith, webgl;

  webgl = (function() {
    var canvas;
    try {
      canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (_error) {
      return false;
    }
  })();

  endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  Polymer({
    is: 'rs-sphere',
    properties: {
      loading: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        readOnly: true,
        notify: true
      },
      src: {
        type: String,
        observer: 'sourceChanged'
      },
      fov: {
        type: Number,
        observer: 'fovChanged',
        reflectToAttribute: true,
        notify: true,
        value: 75
      },
      rotate: {
        type: Boolean,
        observer: 'rotateChanged',
        reflectToAttribute: true,
        notify: true,
        value: false
      },
      stereo: {
        type: Boolean,
        observer: 'stereoChanged',
        reflectToAttribute: true,
        notify: true,
        value: false
      },
      gyroscope: {
        type: Boolean,
        observer: 'gyroscopeChanged',
        reflectToAttribute: true,
        notify: true,
        value: false
      },
      rotateX: {
        type: Number,
        observer: 'rotateXChanged',
        reflectToAttribute: true,
        notify: true,
        value: 0
      },
      rotateY: {
        type: Number,
        observer: 'rotateYChanged',
        reflectToAttribute: true,
        notify: true,
        value: 0
      },
      rotateZ: {
        type: Number,
        observer: 'rotateZChanged',
        reflectToAttribute: true,
        notify: true,
        value: 0
      }
    },
    behaviors: [Polymer.IronResizableBehavior],
    listeners: {
      'iron-resize': '_onIronResize'
    },
    created: function() {
      var light;
      THREE.ImageUtils.crossOrigin = '';
      this.scene = new THREE.Scene();
      this.sphere = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 32));
      this.sphere.scale.x = -1;
      this.scene.add(this.sphere);
      this.scene.add(new THREE.AmbientLight(0x333333));
      light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 3, 5);
      this.scene.add(light);
      this.camera = new THREE.PerspectiveCamera(75, 0, 1, 1000);
      this.camera.position.z = 1.5;
      this.renderer = webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
      this.stereoEffect = new THREE.StereoEffect(this.renderer);
      this.actualRenderer = this.renderer;
      return this._dirty = true;
    },
    attached: function() {
      var animate, render, webglEl;
      this.controls = new THREE.OrbitControls(this.camera, this.$.webgl);
      this.controls.noPan = true;
      this.controls.noZoom = true;
      this.controls.noRotate = this.gyroscope;
      this.controls.autoRotate = this.rotate && !this.gyroscope;
      this.controls.autoRotateSpeed = 0.5;
      this.controls.addEventListener('change', (function(_this) {
        return function() {
          _this.rotateX = _this.camera.rotation.x;
          _this.rotateY = _this.camera.rotation.y;
          _this.rotateZ = _this.camera.rotation.z;
          return _this._dirty = true;
        };
      })(this));
      render = (function(_this) {
        return function() {
          if (typeof video !== "undefined" && video !== null) {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              videoImageContext.drawImage(video, 0, 0);
              if (videoTexture) {
                videoTexture.needsUpdate = true;
              }
            }
          }
          return _this.actualRenderer.render(_this.scene, _this.camera);
        };
      })(this);
      animate = (function(_this) {
        return function() {
          if (!_this.gyroscope) {
            _this.controls.update();
          }
          if (_this._dirty) {
            _this._dirty = false;
            render();
          }
          return requestAnimationFrame(animate);
        };
      })(this);
      webglEl = this.$.webgl;
      webglEl.appendChild(this.renderer.domElement);
      animate();
      webglEl.addEventListener('mousewheel', ((function(_this) {
        return function(e) {
          return _this.onMouseWheel(e);
        };
      })(this)), false);
      webglEl.addEventListener('DOMMouseScroll', ((function(_this) {
        return function(e) {
          return _this.onMouseWheel(e);
        };
      })(this)), false);
      return this.async(this.notifyResize, 1);
    },
    detached: function() {
      if (this._gyroWrapper != null) {
        return window.removeEventListener("deviceorientation", this._gyroWrapper, false);
      }
    },
    sourceChanged: function(src) {
      var imageTexture, texture, video, videoImage, videoImageContext, videoTexture;
      this._setLoading(true);
      texture = this.src;
      if (endsWith(texture, '.webm') || endsWith(texture, '.mp4')) {
        video = document.createElement('video');
        if (endsWith(texture, '.webm')) {
          video.type = 'video/webm';
        } else {
          video.type = 'video/mp4';
        }
        video.src = texture;
        video.loop = true;
        video.load();
        video.play();
        videoImage = document.createElement('canvas');
        videoImage.width = 720;
        videoImage.height = 360;
        videoImageContext = videoImage.getContext('2d');
        videoImageContext.fillStyle = '#000000';
        videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);
        videoTexture = new THREE.Texture(videoImage);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        this.sphere.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
          overdraw: true
        });
        return this._setLoading(false);
      } else {
        imageTexture = THREE.ImageUtils.loadTexture(src, void 0, (function(_this) {
          return function() {
            var ref;
            if ((ref = _this.renderer) != null) {
              ref.render(_this.scene, _this.camera);
            }
            return _this._setLoading(false);
          };
        })(this));
        imageTexture.minFilter = THREE.LinearFilter;
        return this.sphere.material = new THREE.MeshBasicMaterial({
          map: imageTexture
        });
      }
    },
    fovChanged: function(fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      return this._dirty = true;
    },
    rotateChanged: function(rotate) {
      var ref;
      return (ref = this.controls) != null ? ref.autoRotate = rotate : void 0;
    },
    stereoChanged: function(stereo) {
      this.actualRenderer = this.stereo ? this.stereoEffect : this.renderer;
      this.actualRenderer.setSize(this.clientWidth, this.clientHeight);
      return this._dirty = true;
    },
    _gyroSensor: function(ev) {
      var alpha, beta, deviceEuler, finalQuaternion, gamma, minusHalfAngle, orient, screenTransform, worldTransform;
      alpha = THREE.Math.degToRad(ev.alpha || 0);
      beta = THREE.Math.degToRad(ev.beta || 0);
      gamma = THREE.Math.degToRad(ev.gamma || 0);
      orient = THREE.Math.degToRad(window.orientation || 0);
      if (alpha === 0 || beta === 0 || gamma === 0) {
        return;
      }
      finalQuaternion = new THREE.Quaternion();
      deviceEuler = new THREE.Euler();
      screenTransform = new THREE.Quaternion();
      worldTransform = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
      deviceEuler.set(beta, alpha, -gamma, 'YXZ');
      finalQuaternion.setFromEuler(deviceEuler);
      minusHalfAngle = -orient / 2;
      screenTransform.set(0, Math.sin(minusHalfAngle), 0, Math.cos(minusHalfAngle));
      finalQuaternion.multiply(screenTransform);
      finalQuaternion.multiply(worldTransform);
      this.camera.quaternion.copy(finalQuaternion);
      return this._dirty = true;
    },
    gyroscopeChanged: function(gyroEnabled) {
      var ref, ref1, ref2, ref3;
      if (gyroEnabled) {
        if ((ref = this.controls) != null) {
          ref.enabled = false;
        }
        if (window.DeviceOrientationEvent) {
          this._gyroWrapper = (function(_this) {
            return function(e) {
              return _this._gyroSensor(e);
            };
          })(this);
          window.addEventListener("deviceorientation", this._gyroWrapper, false);
        }
      } else {
        if ((ref1 = this.controls) != null) {
          ref1.enabled = true;
        }
        window.removeEventListener("deviceorientation", this._gyroWrapper, false);
      }
      if ((ref2 = this.controls) != null) {
        ref2.noRotate = gyroEnabled;
      }
      return (ref3 = this.controls) != null ? ref3.autoRotate = this.rotate && !gyroEnabled : void 0;
    },
    rotateXChanged: function(x) {
      this.camera.rotation.x = x;
      return this._dirty = true;
    },
    rotateYChanged: function(y) {
      this.camera.rotation.y = y;
      return this._dirty = true;
    },
    rotateZChanged: function(z) {
      this.camera.rotation.z = z;
      return this._dirty = true;
    },
    onMouseWheel: function(event) {
      var delta;
      delta = 0;
      if (event.wheelDeltaY) {
        delta = -event.wheelDeltaY * 0.05;
      } else if (event.wheelDelta) {
        delta = -event.wheelDelta * 0.05;
      } else if (event.detail) {
        delta = event.detail * 1.0;
      }
      return this.fov = Math.max(40, Math.min(100, this.fov + delta));
    },
    _onIronResize: function() {
      if (this.offsetWidth > 0 && this.offsetHeight > 0) {
        this.actualRenderer.setSize(this.offsetWidth, this.offsetHeight);
        this.camera.aspect = this.offsetWidth / this.offsetHeight;
        this.camera.updateProjectionMatrix();
        return this._dirty = true;
      }
    }
  });

}).call(this);
