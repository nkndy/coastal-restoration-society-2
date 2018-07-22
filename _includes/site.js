{% capture p1 %}{{ 'uploads/cc1.JPG' | absolute_url }}{% endcapture %}
{% capture p2 %}{{ 'uploads/cc4.jpg' | absolute_url }}{% endcapture %}
{% capture p3 %}{{ 'uploads/cc3.JPG' | absolute_url }}{% endcapture %}

var subscription = "Annual";

function donationTypeOne(type) {
  var slideText = $('#slide-text-1');
  // If the checkbox is checked, display the output text
  if (type == true){
    slideText.text("One Time");
    subscription = "OneTime"
  } else {
    slideText.text("Annual");
    subscription = "Annual"
  }
}

$( "#slide-text-1" ).click(function() {
  donationTypeOne($("#slide-toggle-1").is(':checked'));
});

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
            "subscriptionType": subscription
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
	playP1Video(false);
});

function getPlan(str) {
  switch (str) {
    case "coastalAmbassador":
      return "Coastal Ambassador"
      break;
    case "salmonSchool":
      return "Salmon School"
      break;
    case "wolfPack":
      return "Wolf Pack"
      break;
    case "orcaPod":
      return "Orca Pod"
      break;
    case "adoptCoastline":
      return "Adopt A Coastline"
      break;
    default:
      return coastalAmbassador
  }
}

function getAmount(str) {
  switch (str) {
    case "coastalAmbassador":
      return "$500"
      break;
    case "salmonSchool":
      return "$1500"
      break;
    case "wolfPack":
      return "$5000"
      break;
    case "orcaPod":
      return "$25000"
      break;
    // case "adoptCoastline":
    //   return "n/a"
    //   break;
    default:
      return coastalAmbassador
  }
}

$('#donate-button-1').click(function(e) {
	e.preventDefault();
  var target = $( ".donation-tier" ).find( "i.active" );
  var planStr = $(target.siblings(".donation-title"));
  planStr = planStr.attr("id");
  $("#plan-name").html(getPlan(planStr));
  $("#amount").text(getAmount(planStr));

	var subscriptionStr = $('#slide-text-1').text();
	$("#subscription").html(subscriptionStr);

	backButtonVisibility("donate");
});
$('.portal-page.intro').click(function(e) {
	toggleIntro();
	backButtonVisibility("video");
	playP1Video(true);
});

// back button functionality

function backButtonVisibility(location) {
    if ( location ==  "donate" ) {
      $('.donor').hide();
      $('#one').hide();
      $('#two').hide();
    } else if (location != "intro") {
			$('#back-button').show();
      $('.donor').show();
		} else {
			$('#back-button').hide();
      $('.donor').hide();
		}
}

$('#back-button').click(function(e) {
	if ( $('.portal-page.two').css('display') == 'none' ){
		backButtonVisibility("map")
		toggleMap();
	} else if ( $('.portal-page.one').css('display') == 'none' ) {
		backButtonVisibility("info")
		toggleInfo();
		playP1Video(true);
	} else if ( $('.portal-page.intro').css('display') == 'none' ) {
		backButtonVisibility("intro")
		toggleIntro();
		playP1Video(false);
	} else {
		// do nothing
	}
});

var activePlayer = new Vimeo.Player(document.getElementById('p1-video-1'));

function playP1Video(playSlide) {
  // get current video
	if ( playSlide == true )  {
    activePlayer.on('play', function(data) {
      if (data.seconds != 0) {
          activePlayer.setCurrentTime(0);
      }
    });
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
      $("#payment-form").trigger("reset");
      card.clear();
			if ( $('.portal-page.two').css('display') == 'none' ){
				backButtonVisibility("map")
				toggleMap();
			}
			if ( $('.portal-page.one').css('display') == 'none' ) {
				backButtonVisibility("info")
				toggleInfo();
				playP1Video(true);
			}
			if ( $('.portal-page.intro').css('display') == 'none' ) {
				backButtonVisibility("intro")
				toggleIntro();
				playP1Video(false);
			}
      $(".poi-col #one").addClass("heartbeat");
      restartForm();
        // your function for too long inactivity goes here
        // e.g. window.location.href = 'logout.php';
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(yourFunction, 120000);  // time is in milliseconds
    }
}
idleLogout();

var tallness = $("#match-1").height();
$("#match-2").height(tallness);

$('.bad-button h2').click(function(){
  if ($(".bad-button + div ").height() == 0) {
    $(".bad-button + div ").animate({
      height: $(".bad-button + div").get(0).scrollHeight
    });
    $(".bad-button .triangle-right").toggleClass("down");
  } else {
    $(".bad-button + div ").animate({
      height: 'toggle'
    });
    $(".bad-button .triangle-right").toggleClass("down");
  }
});

$( ".donation-title" ).click(function(e) {
  const coastalAmbassador = "Join the CleanUp team with this contribution that helps restore wildlife habitat in Clayoquot Sound.  You’ll be recognized as a Coastal Ambassador on our website and receive our seasonal newsletter.";
  const salmonSchool = "Tailored for individuals who want to protect essential habitat for keystone species like salmon in Clayoquot Sound.  You’ll be recognized on our website, receive our seasonal newsletter and a custom Coastal Ambassador t-shirt.";
  const wolfPack = "Restoring habitat for bears and wolves is a large part of what motivates our rehabilitation efforts every year.  You’ll be recognized on our website, receive our seasonal newsletter, and custom Coastal Ambassador t-shirts for the whole pack.";
  const orcaPod = "First Nations legends claim Orca’s are the protectors of our coast. As part of the Orca Pod you will have a critical role in ensuring that the most important habitat in Clayoquot Sound is protected from the harmful effects of ocean plastics.";
  const adoptCoastline = "Coming Soon! Your contributions keep our technicians on the ground, our boats on the water, and our helicopters in the air removing toxic pollutants from local wildlife habitat.";
  var target = $(e.target);
  if (target.siblings("i").hasClass( "active" ) != true) {
    $( ".donation-tier" ).find( "i.active" ).removeClass( "active" );
  }
  target.siblings("i").toggleClass("active");
  if (target.siblings("i").hasClass( "active" ) == true) {
    $(".donation-description").removeClass("hide");
  } else {
    $(".donation-description").addClass("hide");
  }
  if (target.is("#adoptCoastline")) {
    $('.donation-description section.row').addClass('hide');
  } else {
    $('.donation-description section.row').removeClass('hide');
  }

  function getText(id) {
    switch (id) {
      case "coastalAmbassador":
        return coastalAmbassador
        break;
      case "salmonSchool":
        return salmonSchool
        break;
      case "wolfPack":
        return wolfPack
        break;
      case "orcaPod":
        return orcaPod
        break;
      case "adoptCoastline":
        return adoptCoastline
        break;
      default:
        return coastalAmbassador
    }
  }
  $('.donation-description p').text(getText(target.attr('id')));
});

var modalPlayer1 = new Vimeo.Player(document.getElementById('p2-video-1'));
$('#modal-1').on('show.bs.modal', function (e) {
  $(".poi-col #one").removeClass("heartbeat");
  modalPlayer1.on('play', function(data) {
    if (data.seconds != 0) {
        modalPlayer1.setCurrentTime(0);
    }
  });
  modalPlayer1.play();
});
$('#modal-1').on('hidden.bs.modal', function (e) {
  modalPlayer1.pause();
})

var modalPlayer2 = new Vimeo.Player(document.getElementById('p2-video-2'));
$('#modal-6').on('show.bs.modal', function (e) {
  modalPlayer2.on('play', function(data) {
    if (data.seconds != 0) {
        modalPlayer2.setCurrentTime(0);
    }
  });
  modalPlayer2.play();
})
$('#modal-6').on('hidden.bs.modal', function (e) {
  modalPlayer2.pause();
})
