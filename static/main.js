$('.bl-item').each(function() {
  $this = $(this);
  $this.find('.name').text($this.find('.name').find('a').text());
  $this.find('.edit').removeClass('edit').addClass('update');

  $this.find('.cancel').find('a').click(function() {
    $this.removeClass('active');
    $this.find('.name').text($this.find('.name').find('input').val());
    $this.find('.desc').text($this.find('.desc').find('textarea').val());
    $this.find('.priority').text($this.find('.priority').find('input').val());
  });

  $this.find('.update').find('a').text('Update').click(function() {
    console.log('click');
    // console.log($this.parents('section').find('h2').text());
    var params = {
      type: $this.parents('section').find('h2').text(),
      name: $this.find('.name').find('input').val(),
      desc: $this.find('.desc').find('textarea').val(),
      priority: $this.find('.priority').find('input').val()
    }
    $.post(this.href, params, function() {
      $this.find('.cancel').find('a').click();
    });
    return false
  });

  $this.find('.close').find('a').click(function() {
    $.get(this.href, function() {
      $this.hide();
    });
    return false
  });
});

$('.bl-item').dblclick(function() {
  $this = $(this);
  if ( $this.is('.active') ) { 
    return false;
  };
  $this.addClass('active');
  // var name = $this.find('.name').text();
  $this.find('.name').html($('<input>').val($this.find('.name').text()))
  $this.find('.desc').html($('<textarea>').val($this.find('.desc').text()))
  $this.find('.priority').html($('<input>').val($this.find('.priority').text()))

});
