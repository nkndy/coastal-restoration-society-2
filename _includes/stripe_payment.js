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

}

var resetForm = document.getElementById('reset-form');
resetForm.addEventListener("click", retry);

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
      $('#status-container').fadeToggle(250, function(){
        $('#success-container').fadeToggle(50, function(){
          $('#success-msg').html('Your contributions keep our technicians on the ground, our boats on the water, and our helicopters in the air removing toxic pollutants from local wildlife habitat. You will recieve an email with additional information about your donation. Please respond directly with any questions you may have about your contribution.<h4 class="pt-4 text-center text-uppercase">Thank you! and welcome to the cleanup.</h4>');
          $('#success-msg').fadeToggle(250);
        });
      });
      console.log(stripeCustomer);
    }).fail(function(e) {
      $('#spinner.animated').fadeToggle(200, function(){
        $('#transaction-fail').fadeToggle(50, function(){
          $('#status-msg').html('<h4 class="text-center text-uppercase">Oh no!</h4>' + '<h6 class="text-center pt-3 text-uppercase">' + e.responseJSON.message + '</h6>' + '<div id="reset-form" class="text-center pt-1"><i class="fas fa-redo-alt fa-2x"></i></div>');
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
            $("#status-container").fadeToggle(200, function(){
              submitForm(result.token);
            });
          })
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
