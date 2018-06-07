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
        color: "#BFAEF6"
      },
      ":-webkit-autofill": {
        color: "#fce883"
      }
    },
    invalid: {
      iconColor: "#FFC7EE",
      color: "#FFC7EE"
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
        url: 'https://wt-b9fa931cbbfbac80477a7365ca8d3306-0.sandbox.auth0-extend.com/coastal-restoration-stripe',
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
      $('#payment-submit').text("success");
      $('#spinner').one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(){
        // Do something once!
        console.log('this would show once');
      });
      console.log(stripeCustomer);
    }).fail(function(e) {
      $('#payment-submit').text(e.responseJSON.message);
    });
  }

//create a token
var form = document.getElementById('payment-form');
var button = document.getElementById('payment-submit')
button.addEventListener('click', function(event) {
  event.preventDefault();
  $('#payment-submit').text("spinner");
  $( "#payment-form" ).fadeOut(500, function() {
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
