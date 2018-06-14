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
nameInput.addEventListener('change', function(event) {
  $("#card-errors").fadeToggle(250);
});
phoneInput.addEventListener('change', function(event) {
  $("#card-errors").fadeToggle(250);
});
emailInput.addEventListener('change', function(event) {
  $("#card-errors").fadeToggle(250);
});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    $("#card-errors").html(function(){
      return '<i class="fas fa-exclamation-triangle"></i> ' + event.error.message;
    });
    $( "#card-errors:hidden" ).fadeIn( 250 );
  } else {
    displayError.textContent = '';
  }
});

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
            "plan": "Coastal Warrior"
          }
        }
    }).then(function(stripeCustomer) {
      var slideDuration = 225;
      $('#payment-submit').text("success");
      $("#spinner.animated").fadeToggle(200, function(){
        $("#spinner-success").fadeToggle(200, function(){
        $('#success-msg')
          .stop(true, true)
          .animate({
            height:"toggle",
            opacity:"toggle"
          },1000);
        })
      });
      console.log(stripeCustomer);
    }).fail(function(e) {
      $('#payment-submit').text(e.responseJSON.message);
      $( "#payment-form" ).fadeToggle(350);
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
  var validates = [isValidName, isValidEmail, isValidPhone];
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
        submitForm(result.token);
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
      case 3:
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
