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
  function linkscrollto() {
    $("*[data-scroll]").on("click", function(e) {
      var $this = $(this),
        dataScroll = $this.attr("data-scroll");

      if (typeof dataScroll == 'undefined') { return false; }
      e.preventDefault();
      disableScroll();
      if( $(e.target).closest(".menuBlock").length > 0 ){
        mobileMenu("close");
      }
      TweenLite.to(window, 0.8, {
        ease: Sine.easeInOut,
        scrollTo: $("" + dataScroll + "").offset().top - $("header").outerHeight(),
        onComplete: function() {
          enableScroll();
        }
      });
    });
  }


  function formsActions() {
    var $forms = $(".formBlock form"),
        $form1 = $("#bid");

    $forms.find("input[name='name']").one("focus", function() {
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

    $forms.find("input[name='email']").one("focus", function() {
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

    $forms.find("input[name='password']").on("focus change", function() {
        if ($(this).val().trim().length > 0) {
          $(this).addClass("active complete");
        } else {
          $(this).removeClass("active complete"); 
        }
    });


    $("#b1 input[type='checkbox'][name='rules']").on("change", function(){
      var $this = $(this);
      if ($this.prop('checked')) {
          $this.addClass("complete");
          $this.removeClass("uncomplete");
      } else {
          $this.addClass("uncomplete");
          $this.removeClass("complete");
      }
      $("input[type='checkbox'][name='rules']").prop( "checked",  $this.is(':checked') );
    });

    $("body").on("click", ".rulesBlock .desc_txt", function(){
      var $inpt = $(this).closest(".rulesBlock").find("input")
      $inpt.prop( "checked",  !$inpt.is(':checked') );
      $inpt.trigger("change");
    })


    $forms.on('submit', function(event) {
      var $thisForm = $(this),
          submit = $thisForm.find("input[type='submit']");
      if (submit.hasClass("loading")) { return false; }

      if( $thisForm.hasClass("hidden") ){
        var $block = $(".formBlock");
        var startH = $block.outerHeight();
        $forms.not($thisForm).addClass("hidden");
        $thisForm.removeClass("hidden");
        var endH = $block.outerHeight();
        TweenMax.set($block, { height: startH });
        TweenMax.to($block, 0.2, {
            height: endH,
            onComplete: function() {
                TweenMax.set($block, { clearProps: "all" });
            }
        });

        return false;
      }

      if (
        $thisForm.find("input.ajax:not(.complete)").length > 0 ||
        $thisForm.find("input[name='rules']:not(.complete)").length > 0
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
        $thisForm.find("input.ajax.need").each(function() {
          var $this = $(this);
          if (!$this.inputmask("isComplete") ) {
            $this.addClass("uncomplete");
          }
        });
        if (!$forms.find("input[name='rules']").prop('checked')) {
            $forms.find("input[name='rules']").addClass("uncomplete");
        }

        return false;
      }

      event.preventDefault();
      submit.addClass('loading');

      var data = {};
      $thisForm.find("input.ajax").each(function(index, one) {
        var value = decodeURIComponent(this.value);
        data[this.name] = isJSON(value) ? JSON.parse(value) : value;
      });


      $.ajax({
        type: 'POST',
        url: $thisForm.attr("action"),
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

  function getScriptForm() {

      $("*[data-action='getScript_Js']").on("click", function(e) {
          var $this = $(this),
              initTarifValue = $this.attr("data-select");

          e.preventDefault();

          var $form = $(".getScriptForm");

          $.magnificPopup.open({
              items: {
                  src: "<div class='defaultPopupContent mfp-with-anim'>" + $form[0].outerHTML + "<div class='response'></div></div>",
                  type: 'inline'
              },
              removalDelay: 500, //delay removal by X to allow out-animation
              closeBtnInside: true,
              mainClass: 'getScript_Js-popup mfp-with-zoom',
              callbacks: {
                  beforeOpen: function() {
                      this.st.mainClass = "getScript_Js-popup mfp-zoom-in defaultPopup";
                  },
                  open: function() {

                      var $form = $(".mfp-content .getScriptForm");

                      if( initTarifValue ){
                        $form.find("*[name='tarif']").val(initTarifValue);
                      }
                      

                      $form.find("input[name='name']").one("focus", function(){
                          $(this).click();
                      }).inputmask("A{2,40}",{ 
                          definitions: {
                              "A": {
                                validator: "[а-яА-ЯA-Za-z0-9 ]",
                                cardinality: 1
                              }
                          },
                          "onincomplete": function(){ 
                              $(this).removeClass("complete"); 
                              $(this).addClass("uncomplete");
                          },
                          "oncomplete": function(){ 
                              $(this).addClass("complete");
                              $(this).removeClass("uncomplete");
                          }
                      });
                      $form.find("input[name='email']").one("focus", function(){
                          $(this).click();
                      }).inputmask("email", {
                          "onincomplete": function() {
                              $(this).removeClass("complete");
                              $(this).addClass("uncomplete");
                          },
                          "oncomplete": function() {
                              $(this).addClass("complete");
                              $(this).removeClass("uncomplete");
                          }
                      });
                      $form.find("input[name='phone']").one("focus", function(){
                          $(this).click();
                      }).inputmask("+7(999)999-99-99", {

                      });

                      var submit = $form.find("input[type='submit']");
                      $form.on('submit', function(event) {
                          if( submit.hasClass("loading") ){ return false; }
                          if ( $form.find("input.ajax:not(.complete)").length > 0 ||
                                $form.find("input[name='rules']:not(.complete)").length > 0
                           ) {
                              $(".mfp-content .response").removeClass("error good").html("Заполните необходимые поля").addClass("error");

                              $form.find("input.ajax.need").each(function() {
                                  var $this = $(this);
                                  if ( !$this.inputmask("isComplete") ) {
                                      $this.addClass("uncomplete");
                                  }
                              });

                              if (!$form.find("input[name='rules']").prop('checked')) {
                                  $form.find("input[name='rules']").addClass("uncomplete");
                              }

                              return false;
                          }

                          event.preventDefault();
                          submit.addClass('loading');

                          var data = {};
                          $form.find(".ajax").each(function(index, one) {
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
                                      $(".mfp-content .response").removeClass("error good").html("Ошибка сервера, попробуйте отправить еще раз или позвоните по телефону +7 (495) 120-32-30").addClass("error");
                                  } else {
                                      $(".mfp-content .response").removeClass("error good").html("Заявка принята, спасибо. В ближайшее время мы свяжемся с вами<br/><br/>Если у вас есть вопросы - звоните, будем рады:<br/>+7 (495) 120-32-30").addClass("good");
                                      submit.prop('disabled', true);
                                  }


                              },
                              error: function() {
                                  $(".mfp-content .response").removeClass("error good").html("При отправке произошла ошибка").addClass("error");
                              }
                          });

                      });

                  },
                  beforeClose: function() {

                  },
              },
              midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
          });

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
    linkscrollto();
    formsActions();
    getScriptForm();
  });

  // $(window).on("debouncedresize", function(event) {

  // });

})();