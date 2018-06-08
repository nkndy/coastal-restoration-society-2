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
      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",

      "::placeholder": {
        color: "#bec8cf",
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

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
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
  $( "#payment-form" ).fadeToggle(350, function(){
    $( "#spinner" ).fadeToggle(350);
  });
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
});
