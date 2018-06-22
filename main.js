var $form = $('#signUpForm')
$form.on('submit', (aim) =>{
  aim.preventDefault()
  let need = [emal, username, password, confirmation_password]
  need.forEach((name) =>{
    let value = $form.find(`[name = ${name}]`).val()
  })
})
