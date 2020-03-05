
$('#car-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/cars/1?' + search, function(data) {
    $('#car-grid').html('');
    data.forEach(function(car) {

      
        $('#car-grid').append(`
        <div class="col-md-4 col-sm-6">
          <div class="thumbnail">
          <a href="../../cars/cars/${ car._id }">
            <img src="../images/${ car.image }" style="width:290px; height:230px;"/>
          </a>
            
            <p style="text-align: center; font-size: 1.2rem">
              <a href="../../cars/cars/${ car._id }" class="caption">${ car.model }</a>
            </p>
          </div>
        </div>
      `);
      
      
    });
  });
});

$('#car-search').submit(function(event) {
  event.preventDefault();
});