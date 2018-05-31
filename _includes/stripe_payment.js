// Create a Stripe client.
var stripe = Stripe('pk_test_sVOSwu1mjrLOs2C6m9Gjia8t');

// Create an instance of Elements.
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element.
var card = elements.create('card', {style: style});

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
  // console.log(token)
    $.ajax({
        url: 'https://wt-b9fa931cbbfbac80477a7365ca8d3306-0.sandbox.auth0-extend.com/coastal-restoration-stripe',
        type: 'POST',
        data: {
          stripeToken: token,
          email: 'test@test.com',
        }
    }).then(function(stripeCustomer) {
      console.log('success');
      console.log(stripeCustomer);
    }).fail(function(e) {
      $('.pay').text('Buy');
      console.log('There was an error processing the payment. Please try again.');
    });
  }

//create a token
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

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
