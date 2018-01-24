(function() {
  /*PAGE GLOBAL*/
  SmoothScroll({
    // Scrolling Core
    animationTime: 500, // [ms]
    stepSize: 80, // [px]

    // Acceleration
    accelerationDelta: 50, // 50
    accelerationMax: 3, // 3

    // Keyboard Settings
    keyboardSupport: true, // option
    arrowScroll: 50, // [px]

    // Pulse (less tweakable)
    // ratio of "tail" to "acceleration"
    pulseAlgorithm: true,
    pulseScale: 4,
    pulseNormalize: 1,

    // Other
    touchpadSupport: false, // ignore touchpad by default
    fixedBackground: true,
    excluded: ''
  });

  /*ОТКЛЮЧЕНИЕ ВКЛЮЧЕНИЕ СКРОЛА*/
  var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

  function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
      e.preventDefault();
    e.returnValue = false;
  };

  function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  };

  function disableScroll() {
    if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove = preventDefault; // mobile
    document.onkeydown = preventDefaultForScrollKeys;
  };

  function enableScroll() {
    if (window.removeEventListener)
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
  };

  /*ОТКЛЮЧЕНИЕ ВКЛЮЧЕНИЕ СКРОЛА END*/
  /*PAGE GLOBAL*/
  function menuscrollto() {
    $(".menuBlock .menu .item").on("click", function(e) {
      var $this = $(this),
        dataScroll = $this.attr("data-scroll");

      if (typeof dataScroll == 'undefined') { return false; }
      e.preventDefault();
      disableScroll();
      mobileMenu("close");
      TweenLite.to(window, 0.8, {
        ease: Sine.easeInOut,
        scrollTo: $("" + dataScroll + "").offset().top,
        onComplete: function() {
          enableScroll();
        }
      });
    });
  }

  function toogleTable() {
    var $b = $("#b5"),
      $button = $b.find(".showMore"),
      $itemsWrapper = $b.find(".tableBlock"),
      $extraItems = $b.find(".items .item.extra");

    TweenMax.set($extraItems, { autoAlpha: 0 });
    $button.on("click", function() {
      //TweenMax.killTweensOf( $itemsWrapper );
      if (!$b.hasClass("open")) {
        $b.add($button).addClass("open");
        var startH = $itemsWrapper.outerHeight();
        TweenMax.set($itemsWrapper, { clearProps: "all" });
        $extraItems.show();
        var endH = $itemsWrapper.outerHeight();
        TweenMax.to($extraItems, .15, { autoAlpha: 1 });
        TweenMax.set($itemsWrapper, { height: startH });
        TweenMax.to($itemsWrapper, .3, {
          height: endH,
          onComplete: function() {
            TweenMax.set($itemsWrapper, { clearProps: "all" });
          }
        });
      } else {
        $b.add($button).removeClass("open");
        var startH = $itemsWrapper.outerHeight();
        TweenMax.set($itemsWrapper, { clearProps: "all" });
        $extraItems.hide();
        var endH = $itemsWrapper.outerHeight();
        $extraItems.show();
        TweenMax.set($itemsWrapper, { height: startH });
        TweenMax.to($extraItems, .15, { autoAlpha: 0 });
        TweenMax.to($itemsWrapper, .3, {
          height: endH,
          onComplete: function() {
            $extraItems.hide();
            TweenMax.set($itemsWrapper, { clearProps: "all" });
          }
        });
      }
    });
  }


  function formBid() {
    var $form = $("#bid");

    $form.find("input[name='name']").one("focus", function() {
      $(this).click();
    }).inputmask("A{2,40}", {
      definitions: {
        "A": {
          validator: "[а-яА-ЯA-Za-z0-9 ]",
          cardinality: 1
        }
      },
      "onincomplete": function() {
        $(this).removeClass("complete");
        $(this).addClass("uncomplete");
        if ($(this).val().trim().length > 0) {
          $(this).addClass("active");
        } else {
          $(this).removeClass("active");
        }
      },
      "oncomplete": function() {
        $(this).addClass("complete active");
        $(this).removeClass("uncomplete");

      }
    });
    $form.find("input[name='email']").one("focus", function() {
      $(this).click();
    }).inputmask("email", {
      "onincomplete": function() {
        $(this).removeClass("complete");
        $(this).addClass("uncomplete");
        if ($(this).val().trim().length > 0) {
          $(this).addClass("active");
        } else {
          $(this).removeClass("active");
        }
      },
      "oncomplete": function() {
        $(this).addClass("complete");
        $(this).removeClass("uncomplete");
      }
    });

    var submit = $form.find("input[type='submit']");

    $form.on('submit', function(event) {
      if (submit.hasClass("loading")) { return false; }
      if (
        //$form.find("input[name='rules']:not(.complete)").length > 0 ||
        $form.find("input.ajax:not(.complete)").length > 0
      ) {
        $.magnificPopup.open({
          items: {
            src: "<div class='defaultPopupContent mfp-with-anim'>Заполните необходимые поля</div>",
            type: 'inline'
          },
          removalDelay: 500, //delay removal by X to allow out-animation
          closeBtnInside: true,
          mainClass: 'mfp-with-zoom',
          callbacks: {
            beforeOpen: function() {
              this.st.mainClass = "mfp-zoom-in defaultPopup";
            },
            beforeClose: function() {

            },
          },
          midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
        });
        $form.find("input.ajax").each(function() {
          var $this = $(this);
          if (!$this.inputmask("isComplete")) {
            $this.addClass("uncomplete");
          }
        });
        // if (!$form.find("input[name='rules']").prop('checked')) {
        //     $form.find("input[name='rules']").addClass("uncomplete");
        // }

        return false;
      }

      event.preventDefault();
      submit.addClass('loading');

      var data = {};
      $form.find("input.ajax").each(function(index, one) {
        var value = decodeURIComponent(this.value);
        data[this.name] = isJSON(value) ? JSON.parse(value) : value;
      });


      $.ajax({
        type: 'POST',
        url: $form.attr("action"),
        data: data,
        dataType: 'json',
        success: function(response) {
          submit.removeClass('loading');
          if (response.status != 'ok') {
            $.magnificPopup.open({
              items: {
                src: "<div class='defaultPopupContent mfp-with-anim'>Ошибка сервера, попробуйте отправить еще раз или позвоните по телефону +7 (495) 120-32-30</div>",
                type: 'inline'
              },
              removalDelay: 500, //delay removal by X to allow out-animation
              closeBtnInside: true,
              mainClass: 'mfp-with-zoom',
              callbacks: {
                beforeOpen: function() {
                  this.st.mainClass = "mfp-zoom-in defaultPopup";
                },
                beforeClose: function() {

                },
              },
              midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
            });
          } else {
            $.magnificPopup.open({
              items: {
                src: "<div class='defaultPopupContent mfp-with-anim'>Заявка принята, спасибо. В ближайшее время мы свяжемся с вами<br/><br/>Если у вас есть вопросы - звоните, будем рады:<br/>+7 (495) 120-32-30</div>",
                type: 'inline'
              },
              removalDelay: 500, //delay removal by X to allow out-animation
              closeBtnInside: true,
              mainClass: 'mfp-with-zoom',
              callbacks: {
                beforeOpen: function() {
                  this.st.mainClass = "mfp-zoom-in defaultPopup";
                },
                beforeClose: function() {

                },
              },
              midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
            });
            submit.prop('disabled', true);
          }


        },
        error: function() {
          $.magnificPopup.open({
            items: {
              src: "<div class='defaultPopupContent mfp-with-anim'>При отправке произошла ошибка</div>",
              type: 'inline'
            },
            removalDelay: 500, //delay removal by X to allow out-animation
            closeBtnInside: true,
            mainClass: 'mfp-with-zoom',
            callbacks: {
              beforeOpen: function() {
                this.st.mainClass = "mfp-zoom-in defaultPopup";
              },
              beforeClose: function() {

              },
            },
            midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
          });
        }
      });

    });
  }


  function b4Slider() {
    var myInterval;

    var owl = $("#b4 .partnersBlock .items");
    if (owl.length == 0) { return false; }

    var lay800;
    if ($('.check800lay').is(':visible')) {
      lay800 = "lt800";
    } else {
      lay800 = "gt800";
    }


    function isChangePageLayout() {
      if ($('.check800lay').is(':visible') && lay800 == "gt800") {
        lay800 = "lt800";
        return true;
      } else if (!$('.check800lay').is(':visible') && lay800 == "lt800") {
        lay800 = "gt800";
        return true;
      } else {
        return false;
      }
    }

    function createSlider() {
      owl.addClass("owl-carousel");
      var time = 8000;

      owl.owlCarousel({
        loop: false,
        items: 4,
        slideBy: 4,
        navRewind: false,
        margin: 40,
        nav: true,
        autoHeight: false,
        autoplay: true,
        autoplayTimeout: time,
        autoplayHoverPause: true,
        smartSpeed: 400,
        navText: ['<svg class="icon"><use xlink:href="../images/symbol/sprite.svg#ico-leftArrow"></use></svg>',
          '<svg class="icon"><use xlink:href="../images/symbol/sprite.svg#ico-rightArrow"></use></svg>'
        ],
        responsive: {
          0: {
            margin: 10,
          },
          980: {
            margin: 20,
          },
          1150: {
            margin: 40,
          }
        }
      });

      owl.on("click", function() {
        owl.trigger('stop.autoplay.owl');
        clearInterval(myInterval);
      });
      $("#b4 .descriptions").on("click", function() {
        owl.trigger('stop.autoplay.owl');
        clearInterval(myInterval);
      });


      owl.find(".owl-item").on("click", function() {
        var $this = $(this),
          thisIndex = $this.index(),
          $sliderOwlItems = $("#b4 .partnersBlock .owl-item"),
          $sliderItems = $sliderOwlItems.find(".item"),
          $descitems = $("#b4 .descriptions .item");

        $sliderOwlItems.add($descitems).add($sliderItems).removeClass("current");
        $this.add($this.find(".item")).add($descitems.eq(thisIndex)).addClass("current");
      });

      myInterval = setInterval(function() {
        var $cur = owl.find(".owl-item:has(.item.current)");

        if ($cur.next(".owl-item").length > 0) {
          var $cur = $cur.next(".owl-item"),
            thisIndex = $cur.index(),
            $sliderOwlItems = $("#b4 .partnersBlock .owl-item"),
            $sliderItems = $sliderOwlItems.find(".item"),
            $descitems = $("#b4 .descriptions .item");


          $sliderOwlItems.add($descitems).add($sliderItems).removeClass("current");
          $cur.add($cur.find(".item")).add($descitems.eq(thisIndex)).addClass("current");
        } else {
          var $cur = owl.find(".owl-item").eq(0),
            thisIndex = $cur.index(),
            $sliderOwlItems = $("#b4 .partnersBlock .owl-item"),
            $sliderItems = $sliderOwlItems.find(".item"),
            $descitems = $("#b4 .descriptions .item");


          owl.trigger("to.owl.carousel", [0, false, true]);
          $sliderOwlItems.add($descitems).add($sliderItems).removeClass("current");
          $cur.add($cur.find(".item")).add($descitems.eq(thisIndex)).addClass("current");
        }
      }, time / 4);
    }

    if (lay800 == "gt800") {
      createSlider();
    }

    $(window).on("debouncedresize", function(event) {
      if (lay800 == "lt800" && isChangePageLayout()) {
        createSlider();
      } else if (lay800 == "gt800" && isChangePageLayout()) {
        var $sliderOwlItems = $("#b4 .partnersBlock .owl-item"),
            $sliderItems = $sliderOwlItems.find(".item"),
            $descitems = $("#b4 .descriptions .item");
        $sliderOwlItems.add($descitems).add($sliderItems).removeClass("current");

        owl.trigger('stop.autoplay.owl');
        clearInterval(myInterval);
        owl.trigger('destroy.owl.carousel');
        owl.removeClass("owl-carousel");
      }
    });

  }

  function mobileMenu(trigger) {
    var $button = $("header .mobileButton"),
      $header = $("header"),
      $menu = $("header .menu"),
      $shadow = $("header .shadow"),
      $collection = $button.add($menu).add($shadow).add($header);

    if( trigger == "init" ){
        $button.on("click", function() {
          $collection.toggleClass("active");
        });
        $shadow.on("click", function() {
          $collection.removeClass("active");
        });
        function checkTop(){
          if ($(window).scrollTop() > 0) {
            $header.addClass("scroll");
          } else {
            $header.removeClass("scroll");
          }
        }
        $(window).scroll(function () {
            checkTop();
            setTimeout(function(){ checkTop(); }, 500);
        });

    }else if( trigger == "close" ){
        $collection.removeClass("active");
    }

  }



  $(document).ready(function() {
    svg4everybody({});
    mobileMenu("init");
    toogleTable();
    menuscrollto();
    formBid();
    b4Slider();
  });

  // $(window).on("debouncedresize", function(event) {

  // });

})();