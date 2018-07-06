{% capture p1 %}{{ 'uploads/cc1.JPG' | absolute_url }}{% endcapture %}
{% capture p2 %}{{ 'uploads/cc4.jpg' | absolute_url }}{% endcapture %}
{% capture p3 %}{{ 'uploads/cc3.JPG' | absolute_url }}{% endcapture %}

// Create a Stripe client.
var stripe = Stripe('pk_test_sVOSwu1mjrLOs2C6m9Gjia8t');

// Create an instance of Elements.
var elements = stripe.elements({
    locale: 'auto'
});

// Custom styling can be passed to options when creating an Element.
// Create an instance of the card Element.
var card = elements.create('card', {
  iconStyle: "solid",
  style: {
    base: {
      iconColor: "#aab7c4",
      color: "#aab7c4",
      fontWeight: 400,
      fontSmoothing: "antialiased",
      fontSize: "12px",
      fontWeight: "400",
      "::placeholder": {
        color: "#bec8cf",
        textTransform: "uppercase",
      },
      ":-webkit-autofill": {
        color: "#fce883"
      }
    },
    invalid: {
      iconColor: "#fce883",
      color: "#fce883"
    }
  }
});

//listen for change in fields and remove error classes
var nameInput = document.getElementById('FormControlInputName');
var phoneInput = document.getElementById('FormControlInputPhone');
var emailInput = document.getElementById('FormControlInputEmail');
nameInput.addEventListener('input', function(event) {
  $('#FormControlInputName').removeClass("error");
  $('label[for=FormControlInputName]').removeClass("highlightError");
});
phoneInput.addEventListener('input', function(event) {
  $('#FormControlInputPhone').removeClass("error");
  $('label[for=FormControlInputPhone]').removeClass("highlightError");
});
emailInput.addEventListener('input', function(event) {
  $('#FormControlInputEmail').removeClass("error");
  $('label[for=FormControlInputEmail]').removeClass("highlightError");
});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    $('#card-element').addClass("error");
    $('label[for=card-element]').addClass("highlightError");
    $("#card-errors").html(function(){
      return '<i class="fas fa-exclamation-triangle"></i> ' + event.error.message;
    });
    $( "#card-errors:hidden" ).fadeIn(250);
  } else {
    displayError.textContent = '';
    $('#card-element').removeClass("error");
    $('label[for=card-element]').removeClass("highlightError");
  }
});

function retry() {
  $('#status-container').fadeToggle(50, function() {
    card.clear();
    $('#payment-form').fadeToggle(200);
    $('#reset-form').fadeToggle(1);
    $('#transaction-fail').fadeToggle(1);
  });
}

var resetForm = document.getElementById('reset-form');
resetForm.addEventListener("click", retry);

// <div id="status-container" style="display: none;">
//   <div id="spinner" class="animated" style="display: none;"></div>
//   <div id="transaction-fail" style="display: none;"><i class="fas fa-exclamation"></i></div>
//   <div class="p-4" id="status-msg"></div>
//   <div id="reset-form" class="text-center pt-1" style="display: none;"><i class="fas fa-redo-alt fa-2x"></i></div>
// </div>
// <div id="success-container" style="display: none;">
//   <div class="spinner-success"><i class="fas fa-check"></i></div>
//   <div class="p-4 text-center" id="success-msg" style="display: none;"></div>
// </div>

function restartForm() {
  $('#payment-form').css('display', 'initial');
  $('#spinner').css('display', 'none');
  $('#status-container').css('display', 'none');
  $('#transaction-fail').css('display', 'none');
  $('#reset-form').css('display', 'none');
  $('#success-container').css('display', 'none');
  $('#success-msg').css('display', 'none');
}

// Handle form submission.
function submitForm(token) {
    $.ajax({
        url: 'https://wt-b9fa931cbbfbac80477a7365ca8d3306-0.sandbox.auth0-extend.com/coastal-restoration',
        type: 'POST',
        data: {
          stripeToken: token,
          email: $('#FormControlInputEmail').val(),
          metadata: {
            "name": $('#FormControlInputName').val(),
            "company_name": $('#FormControlInputCompany').val(),
            "phone": $('#FormControlInputPhone').val(),
            "plan": $('#plan-name').text(),
            "subscriptionType": $('#slide-text').data( "type" )
          }
        }
    }).then(function(stripeCustomer) {
      $('#status-container').fadeToggle(250, function(){
        $('#success-container').fadeToggle(50, function(){
          $('#success-msg').html(' You will recieve an email with additional information about your donation. Please respond directly with any questions you may have about your contribution.<h4 class="pt-4 text-center text-uppercase">Thank you!</h4><h6 class="text-center text-uppercase">welcome to the cleanup.</h6>');
          $('#success-msg').fadeToggle(250);
        });
      });
      console.log(stripeCustomer);
    }).fail(function(e) {
      $('#spinner.animated').fadeToggle(200, function(){
        $('#transaction-fail').fadeToggle(50, function(){
          $('#status-msg').html('<h4 class="text-center text-uppercase">Oh no!</h4>' + '<h6 class="text-center pt-3 text-uppercase">' + e.responseJSON.message + '</h6>');
          $('#reset-form').fadeToggle(50);
        });
      });
    });
}

//create a token
var form = document.getElementById('payment-form');
var button = document.getElementById('payment-submit')
button.addEventListener('click', function(event) {
  event.preventDefault();
  const isValidName = form[2].checkValidity();
  const isValidPhone = form[4].checkValidity();
  const isValidEmail = form[5].checkValidity();
  var validates = [isValidName, isValidPhone, isValidEmail];
  var isValid = false;
  var validationMessage;
  for (var i = 0; i < validates.length; i++) {
    if (validates[i] === false){
      validationMessage = i;
      isValid = false;
      break;
    } else {
      isValid = true;
    }
  }
  if (isValid) {
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Inform the user if there was an error.
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server.
        $('#payment-form').fadeToggle(250, function(){
        $('#status-msg').html('<h6 class="text-center">Please hang on while we process your contribution request<h6>');
          $('#spinner.animated').fadeToggle(50, function(){
          })
          $("#status-container").fadeToggle(200, function(){
            submitForm(result.token);
          });
        });
      }
    });
  } else {
    var displayError = $("#card-errors");
    switch(validationMessage) {
      case 0:
          // errorElement.textContent = "Let us know your name so we know who to thank!";
          displayError.html(function(){
            return '<i class="fas fa-exclamation-triangle"></i> Let us know your name so we know who to thank!';
          });
          $('#FormControlInputName').addClass("error");
          $('label[for=FormControlInputName]').addClass("highlightError");
          break;
      case 1:
          displayError.html(function(){
            return '<i class="fas fa-exclamation-triangle"></i> Please add your phone number so we can thank you!';
          });
          $('#FormControlInputPhone').addClass("error");
          $('label[for=FormControlInputPhone]').addClass("highlightError");
          break;
      case 2:
          displayError.html(function(){
            return '<i class="fas fa-exclamation-triangle"></i> Please add your email so you can recieve your tax receipt and other important info!';
          });
          $('#FormControlInputEmail').addClass("error");
          $('label[for=FormControlInputEmail]').addClass("highlightError");
          break;
    }
    $( "#card-errors:hidden" ).fadeIn( 250 );
  }
});

//toggle slide visibility
function toggleIntro() {
	$(".portal-page.intro").fadeToggle("fast");
}
function toggleInfo() {
	$(".portal-page.one").fadeToggle("fast");
}
function toggleMap() {
	$(".portal-page.two").fadeToggle("fast");
}

//fullscreen button
$(document).ready(function() {
	document.getElementById('fullscreen-button').addEventListener('click', () => {
		if (screenfull.enabled) {
			screenfull.request();
		} else {
			// Ignore or do something else
		}
		$('#fullscreen-button').hide();
	});
});

//move through slides
$('#explore-button').click(function(e) {
	e.preventDefault();
	toggleInfo();
	backButtonVisibility("map");
	playSlide(false);
});
$('#donate-button').click(function(e) {
	e.preventDefault();
	var str = $('#slide-text').text();
	$("#subscription").html(str);
	toggleMap();
	backButtonVisibility("donate");
});
$('.portal-page.intro').click(function(e) {
	toggleIntro();
	backButtonVisibility("video");
	playSlide(true);
});

// back button functionality

function backButtonVisibility(location) {
		if (location != "intro") {
			$('#back-button').show();
		} else {
			$('#back-button').hide();
		}
}

$('#back-button').click(function(e) {
	if ( $('.portal-page.two').css('display') == 'none' ){
		backButtonVisibility("map")
		toggleMap();
	} else if ( $('.portal-page.one').css('display') == 'none' ) {
		backButtonVisibility("info")
		toggleInfo();
		playSlide(true);
	} else if ( $('.portal-page.intro').css('display') == 'none' ) {
		backButtonVisibility("intro")
		toggleIntro();
		playSlide(false);
	} else {
		// do nothing
	}
});

var iframes = document.querySelectorAll('iframe');

var activePlayer = new Vimeo.Player(iframes[0]);
var fromPlayer;

function updateContent(txt, title) {
  var dTitle = $('#title h4');
  var description = $('#description p');
  dTitle.text(title);
  description.html(txt);
}

function switchVideo(currentIndex, previousIndex) {

  activePlayer = new Vimeo.Player(iframes[currentIndex]);
  fromPlayer = new Vimeo.Player(iframes[previousIndex]);

  activePlayer.play().then(function() {
      // the video was played
  }).catch(function(error) {
      switch (error.name) {
          case 'PasswordError':
              // the video is password-protected and the viewer needs to enter the
              // password first
              break;

          case 'PrivacyError':
              // the video is private
              break;

          default:
              // some other error occurred
              break;
      }
  });

  fromPlayer.pause().then(function() {
      // the video was paused
  }).catch(function(error) {
      switch (error.name) {
          case 'PasswordError':
              // the video is password-protected and the viewer needs to enter the
              // password first
              break;

          case 'PrivacyError':
              // the video is private
              break;

          default:
              // some other error occurred
              break;
      }
  });
}

function changeImages(currentIndex, previousIndex) {
  var img1;
  var img2;
  var txt;
  var title;
  switch (currentIndex) {
    case 0:
      img1 = "{{ p1 }}";
      img2 = "{{ p2 }}";
      txt = "Clayoquot Sound needs your help! Ocean plastics and other forms of pollution are washing ashore with every tide. This garbage threatens all kinds of wildlife, Indigenous culture, and the communities that call Clayoquot Sound home. Become a Coastal Ambassador and help protect this wonderful coast with us!<br><br>Travel in our helicopter to remote beaches within Clayoquot Sound and help our rehabilitation efforts to Restore Our Shore. Help us preserve these important areas for breeding, nesting, and foraging for so many kinds of wildlife. Learn about this wildlife from your guide as you enjoy a spectacular aerial safari on the way home.";
      title = "Who we are";
      updateContent(txt, title);
      break;
    case 1:
      img1 = "{{ p2 }}";
      img2 = "{{ p3 }}";
      txt = "Clayoquot CleanUp is a world leader in marine habitat restoration.  Specializing in emergency spill response, accumulated debris removal, and aquaculture site deconstruction and removal our team of technical experts possess advanced training and experience that assures successful restoration of demanding marine environments.";
      title = "What we do";
      updateContent(txt, title);
      break;
    case 2:
      img1 = "{{ p3 }}";
      img2 = "{{ p1 }}";
      txt = "Home to First Nations communities (Hesquiaht, Ahousaht, Tla-o-qui-aht) the District of Tofino, a plethora of visitors, part time residents and colorful characters, the biodiversity of our landscape is mirrored closely by the diversity of its human inhabitants.  Drawing from this diversity and the reliance we have upon the industries of fishing, aquaculture and eco-tourism, the link is clear between healthy landscapes and thriving wildlife and sustainable economic growth and development. <br><br>Clayoquot Sound acts as an aggregator for ocean plastics and marine debris from both domestic and international sources. Commercial fishing gear, jettisoned shipping containers, styrofoam insulation and household plastics are all prevalent examples of pollution that is turning Clayoquot Sound into a landfill.   As a result, cetaceans and other wildlife combat entanglement as a way of life. Whales perish in lost fishing gear, birds choke on plastics mistaken for food and the integrity of the ecosystem as a whole declines.";
      title = "Why clean up";
      updateContent(txt, title);
      break;
  }
  $(".carousel-control-prev").stop().animate({ opacity: 0 }, 150, function(){
    $(this).css({'background-image': "url("+img1+")"})
             .animate({ opacity: 1 },{ duration: 150 });
  });
  $(".carousel-control-next").stop().animate({ opacity: 0 }, 150, function(){
    $(this).css({'background-image': "url("+img2+")"})
             .animate({ opacity: 1 },{ duration: 150 });
  });
}

var videoCarousel = $('#videoCarousel');
videoCarousel.carousel({
  interval: false
})

videoCarousel.on('slid.bs.carousel', function (e) {
  if (e.to === 0) {
    changeImages(e.to, e.from)
    switchVideo(e.to, e.from);
  } else if (e.to == 1) {
    changeImages(e.to, e.from)
    switchVideo(e.to, e.from);
  } else if (e.to == 2) {
    changeImages(e.to, e.from)
    switchVideo(e.to, e.from);
  }
})

function playSlide(correctSlide) {
  // get current video
	if ( correctSlide == true )  {
	  activePlayer.play()
	} else {
		activePlayer.pause()
	}
}

function idleLogout() {
    var t;
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;  // catches touchscreen presses as well
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well
    window.onclick = resetTimer;      // catches touchpad clicks as well
    window.onkeypress = resetTimer;
    window.addEventListener('scroll', resetTimer, true); // improved; see comments

    function yourFunction() {
			console.log("timeout");
      $("#payment-form").trigger("reset");
      card.clear();
			if ( $('.portal-page.two').css('display') == 'none' ){
				backButtonVisibility("map")
				toggleMap();
			}
			if ( $('.portal-page.one').css('display') == 'none' ) {
				backButtonVisibility("info")
				toggleInfo();
				playSlide(true);
			}
			if ( $('.portal-page.intro').css('display') == 'none' ) {
				backButtonVisibility("intro")
				toggleIntro();
				playSlide(false);
			}
      restartForm();
        // your function for too long inactivity goes here
        // e.g. window.location.href = 'logout.php';
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(yourFunction, 12000);  // time is in milliseconds
    }
}
idleLogout();
