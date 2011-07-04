$('.close').click(function() {
  $this = $(this);
  console.log(this.href);
  $.get(this.href, function() {
    $this.parents('tr').hide();
  });
  return false
})
