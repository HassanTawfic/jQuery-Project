let items;
let left=$('#items');
let arrangedItems = new Map();
let cart=$('#CartItems')
let cartTotal= 0;
let discountChecker = false;

//ajax call to retrieve data from file
$.ajax({
    url : 'objects.js',
    success : (response)=> {
        items = JSON.parse(response);
        renderResponse();
        $('#discount').hide();
        $('#totalDiv').removeClass('d-flex').addClass('d-none');
        $('.draggable').draggable({
            revert : true,
            containment : "document"
        });
        $('.droppable').droppable({ drop: function(event,ui){
            let targetItemID = ui.draggable.attr('data-id');
                let checkerForItemExistenceInCart = $(`#CartItems`).has(`.card[data-id=${targetItemID}]`).length
                if (checkerForItemExistenceInCart === 0){
                    renderCardItems(targetItemID);
                }else{
                    RenderCardItemsIfAlreadyExist(targetItemID)
                }
                disableDecButton()
            }})
    },
    error : (err)=>{
        console.log(err);
    }
})
// all functions on html body
$('body').on('click', '.btn', function(){
    let id = $(this).attr('data-id');
    //for add to order button
    if($(this).hasClass("item-btn")){
       let x = $(`#CartItems`).has(`.card[data-id=${id}]`).length
        if (x === 0){
            renderCardItems(id);
        }else{
            RenderCardItemsIfAlreadyExist(id)
        }
        disableDecButton()
    }
    //for Remove Button
    else if($(this).hasClass("delete-btn")) {
        const price = Object.values(arrangedItems.get(id))[2]
        const quantity = $(this).parentsUntil('.card').parent().attr('data-quantity');
        let totalPrice = parseInt(price) * parseInt(quantity)
        cartTotal -= parseInt(totalPrice);
        if (cartTotal < 300 && discountChecker) {
            removeDiscount()
        }
        if (cartTotal === 0) {
            $('#p').show();
            $('#totalDiv').removeClass('d-flex').addClass('d-none');
        }
        $(this).parentsUntil('.card').parent().remove()
        $('#totalPrice').text(cartTotal + " E£")
        //for increase Quantity in item card -> bill
    }else if($(this).hasClass("btn-inc")){
        let itemid = $(this).parentsUntil('.card').parent().attr('data-id');
        RenderCardItemsIfAlreadyExist(itemid)
    }//for decrease Quantity in item card -> bill
    else if($(this).hasClass("btn-dec")){
        let quantity = $(this).parentsUntil('.card').parent().attr('data-quantity');
        if (quantity === '1') {
            return;
        }
        let itemid = $(this).parentsUntil('.card').parent().attr('data-id');
        const price = Object.values(arrangedItems.get(itemid))[2]
        quantity--;
        $(this).parentsUntil('.card').parent().attr('data-quantity',quantity);

        cartTotal -= parseInt(price);
        if (cartTotal < 300 && discountChecker) {
            removeDiscount();
        }
        $(this).siblings('.quantity').text(quantity)
        if (quantity === 1)
        {
            $('#decButton').prop('disabled', true)
        }
        if (cartTotal === 0) {
            $('#p').show();
            $('#totalDiv').removeClass('d-flex').addClass('d-none');
        }
        $('#totalPrice').text(cartTotal + " E£")
    }

});
// ----> Functions <----
//function that generates cart items when dragged & dropped or added by button
function generateHTMLInCart(key,item) {
    return `
    <div data-id="${key}" data-quantity="1" class="draggable card m-2 col-12 d-flex flex-row">
     <div class="card-body">
        <h4 class="card-title">${item.name} - ${item.type}</h4>
        <p class="card-text fw-bold">Unit Price : ${item.price} E£</p>
        <div class="d-flex justify-content-evenly align-items-center fw-bold">
        <p class="text-center m-0">Quantity:</p>
        <div class="d-flex justify-content-center align-items-center">
        <button id="decButton" type="button" disabled class="btn btn-dec btn-outline-danger mx-2 py-0 px-2 display-6" style="width: 30px; height: 25px;">-</button>
        <span class="quantity px-1">1</span>
        <button type="button" class="btn btn-inc btn-outline-success mx-2 py-0 px-2 display-6" style="width: 30px; height: 25px;">+</button>
        </div>
        <div class="d-flex justify-content-end">
             <a href="#" class="btn delete-btn btn-danger ms-auto" data-id="${key}">Remove All</a>
        </div>
        </div>
        
     </div>
    </div>
    `;
}
//function that renders data read from file to html code
function generateHTMLAtStart(key,item){
        return `
<div data-id="${key}" class="draggable card m-2 col-12 d-flex flex-row">
    <img src="${item.url}" width="150" height="" class="" alt="">
        <div class="card-body">
            <h5 class="card-title">${item.name} - ${item.type}</h5>
            <p class="card-text">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et libero obcaecati sit.
            </p>
            <div class="d-flex justify-content-between align-items-center fw-bold">
            <p class="card-text m-0 text-center">
              Price : ${item.price} E£
            </p>
            <div class="d-flex justify-content-end">
             <a href="#" class="item-btn btn btn-primary ms-auto" data-id="${key}">Add to order</a>
            </div>
            </div>
        </div>
</div>
`;
}

//function that renders data from json file to html page
function renderResponse(){
    for (let [key,item] of Object.entries(items)) {
        let struct = generateHTMLAtStart(key,item)
        left.append(struct);
        arrangedItems.set(key,{name:`${item.name}`,type:`${item.type}`,price:`${item.price}`,url:`${item.url}`})
    }
}

//function to render elements from menu to bill
function renderCardItems(id){
    const item = (arrangedItems.get(id))
    $('#p').hide();
    cart.append(generateHTMLInCart(id,item));
    $('.ordersR .draggable').draggable({
        stop: function (event, ui) {
            console.log(ui.draggable)
            console.log(this)
            let targetItemID = $(this).attr('data-id');
            $(`#CartItems .card[data-id=${targetItemID}] .delete-btn`).click();
        }
    });
    const price = Object.values(arrangedItems.get(id))[2]
    cartTotal+=parseInt(price);
    $('#totalDiv').removeClass('d-none').addClass('d-flex');
    if (cartTotal > 300 && !discountChecker) {
        addDiscount()
    }
    $('#totalPrice').text(cartTotal + " E£")
}
//function called to add discount on certain conditions
function addDiscount(){
    cartTotal = cartTotal - 30
    discountChecker = true;
    $('#discount').show();
}
//function that increases the quantity of already existing item in cart
function RenderCardItemsIfAlreadyExist(id){
    let quantity = $(`#CartItems .card[data-id=${id}]`).attr('data-quantity');
    //to get item id and then retrive price
    const price = Object.values(arrangedItems.get(id))[2]
    quantity++;
    $(`#CartItems .card[data-id=${id}]`).attr('data-quantity',quantity);
    cartTotal+=parseInt(price);
    if (cartTotal > 300 && !discountChecker) {
        addDiscount();
    }
    $(`#CartItems .card[data-id=${id}] .quantity`).text(quantity)
    $(`#CartItems .card[data-id=${id}] .btn-dec`).prop('disabled', false)
    $('#totalPrice').text(cartTotal + " E£")
}
function removeDiscount(){
    cartTotal += 30
    discountChecker = false;
    $('#discount').hide();
}
//function that disables decreast button in cart items when quantity equals one
function disableDecButton(){
    let quantity = $(this).parentsUntil('.card').parent().attr('data-quantity');
    if (quantity === 1)
    {
        $('#decButton').addClass('disabled')
    }
}