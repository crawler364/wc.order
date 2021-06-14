class WCSaleBasket {
    constructor(params) {
        this.parameters = params.parameters;
        this.signedParameters = params.signedParameters;
    }

    init() {
        BX.ready(() => {
            BX.bindDelegate(
                document.body,
                'change',
                {tag: 'input', attribute: 'data-basket-item-action'},
                this.processAction.bind(this)
            );

            BX.bindDelegate(
                document.body,
                'click',
                function (el) {
                    let attr = el.getAttribute('data-basket-item-action');
                    return attr === 'plus' || attr === 'minus' || attr === 'delete'
                },
                this.processAction.bind(this)
            );
        });
    }

    getBasketContainersDom() {
        let basketContainers, basketContainersDom = [];

        basketContainers = BX.findChildren(document.body, {
            'attribute': {'data-container': 'wc-basket'}
        }, true);

        basketContainers.forEach((basketContainer, key) => {
            let basketContainerDom = {};

            basketContainerDom.nodes = {
                container: basketContainer,
                weight: BX.findChild(basketContainer, {
                    'attribute': {'data-container': 'basket-weight'}
                }, true, false),
                count: BX.findChild(basketContainer, {
                    'attribute': {'data-container': 'basket-count'}
                }, true, false),
                vatSum: BX.findChild(basketContainer, {
                    'attribute': {'data-container': 'basket-vat-sum'}
                }, true, false),
                basePrice: BX.findChild(basketContainer, {
                    'attribute': {'data-container': 'basket-base-price'}
                }, true, false),
                discountPrice: BX.findChild(basketContainer, {
                    'attribute': {'data-container': 'basket-discount-price'}
                }, true, false),
                price: BX.findChild(basketContainer, {
                    'attribute': {'data-container': 'basket-price'}
                }, true, false),
                empty: BX.findChild(basketContainer, {
                    'attribute': {'data-container': 'basket-empty'}
                }, true, false),
            }

            basketContainersDom[key] = basketContainerDom;
        });

        return basketContainersDom;
    }

    getBasketItemContainersDom(target) {
        let currentBasketItemContainer, basketItemContainers, basketItemContainersDom = [];

        currentBasketItemContainer = BX.findParent(target, {
            attribute: {'data-container': 'basket-item-wrap'}
        });

        this.productId = currentBasketItemContainer.getAttribute('data-basket-item-id');
        this.action = target.getAttribute('data-basket-item-action');
        if (this.action === 'set') {
            this.quantity = BX.findChild(currentBasketItemContainer, {
                'attribute': {'data-basket-item-action': 'set'}
            }, true, false).value;
        } else {
            delete this.quantity;
        }

        basketItemContainers = BX.findChildren(document.body, {
            'attribute': {'data-container': 'basket-item-wrap', 'data-basket-item-id': this.productId}
        }, true);

        basketItemContainers.forEach((basketItemContainer, key) => {
            let basketItemContainerDom = {};

            basketItemContainerDom.propertys = {
                action: this.action,
                productId: this.productId,
                quantity: this.quantity,
            };

            basketItemContainerDom.nodes = {
                container: basketItemContainer,
                basketItem: BX.findChild(basketItemContainer, {
                    'attribute': {'data-container': 'basket-item'}
                }, true, false),
                input: BX.findChild(basketItemContainer, {
                    'attribute': {'data-basket-item-action': 'set'}
                }, true, false),
                priceSum: BX.findChild(basketItemContainer, {
                    'attribute': {'data-container': 'basket-item-price-sum'}
                }, true, false),
                basePriceSum: BX.findChild(basketItemContainer, {
                    'attribute': {'data-container': 'basket-item-base-price-sum'}
                }, true, false),
                discountPriceSum: BX.findChild(basketItemContainer, {
                    'attribute': {'data-container': 'basket-item-discount-price-sum'}
                }, true, false),
                restoreButton: BX.findChild(basketItemContainer, {
                    'attribute': {'data-container': 'basket-item-restore-button'}
                }, true, false),
            };

            basketItemContainersDom[key] = basketItemContainerDom;
        });

        return basketItemContainersDom;
    }

    setBasketContainersDom(basketContainersDom, basket) {
        basketContainersDom.forEach((basketContainerDom) => {
            if (basketContainerDom.nodes.weight) {
                BX.adjust(basketContainerDom.nodes.weight, {html: basket.fields.weightFormatted});
            }
            if (basketContainerDom.nodes.count) {
                BX.adjust(basketContainerDom.nodes.count, {html: basket.fields.count});
            }
            if (basketContainerDom.nodes.vatSum) {
                BX.adjust(basketContainerDom.nodes.vatSum, {html: basket.fields.vatSumFormatted});
            }
            if (basketContainerDom.nodes.basePrice) {
                BX.adjust(basketContainerDom.nodes.basePrice, {html: basket.fields.basePriceFormatted});
            }
            if (basketContainerDom.nodes.discountPrice) {
                BX.adjust(basketContainerDom.nodes.discountPrice, {html: basket.fields.discountPriceFormatted});
            }
            if (basketContainerDom.nodes.price) {
                BX.adjust(basketContainerDom.nodes.price, {html: basket.fields.priceFormatted});
            }
        });
    }

    setBasketItemContainersDom(basketItemContainersDom, basketItem) {
        basketItemContainersDom.forEach((basketItemContainerDom) => {
            if (basketItemContainerDom.nodes.input) {
                basketItemContainerDom.nodes.input.value = basketItem.quantity;
            }
            if (basketItemContainerDom.nodes.priceSum) {
                BX.adjust(basketItemContainerDom.nodes.priceSum, {html: basketItem.priceSumFormatted});
            }
            if (basketItemContainerDom.nodes.basePriceSum) {
                BX.adjust(basketItemContainerDom.nodes.basePriceSum, {html: basketItem.basePriceSumFormatted});
            }
            if (basketItemContainerDom.nodes.discountPriceSum) {
                BX.adjust(basketItemContainerDom.nodes.discountPriceSum, {html: basketItem.discountPriceSumFormatted});
            }
        });
    }

    processAction(e) {
        BX.PreventDefault(e);

        let basketContainersDom = this.getBasketContainersDom();
        let basketItemContainersDom = this.getBasketItemContainersDom(e.target);
        let basketDomHandler;

        if (typeof WCSaleBasketDomHandler === 'function') {
            basketDomHandler = new WCSaleBasketDomHandler({
                basketContainersDom: basketContainersDom,
                basketItemContainersDom: basketItemContainersDom,
            });
        }

        if (typeof basketDomHandler === 'object' && typeof basketDomHandler.processStart === 'function') {
            basketDomHandler.processStart();
        }

        BX.ajax.runComponentAction('wc:basket', 'process', {
            mode: 'ajax',
            data: {
                product: {
                    id: this.productId,
                    quantity: this.quantity,
                    action: this.action
                }
            },
            signedParameters: this.signedParameters
        }).then((response) => {
            if (typeof basketDomHandler === 'object' && typeof basketDomHandler.processEnd === 'function') {
                basketDomHandler.processEnd();
            }

            let basket = response.data.basket;
            let basketItem = response.data.basketItem;
            this.setBasketContainersDom(basketContainersDom, basket);
            this.setBasketItemContainersDom(basketItemContainersDom, basketItem);

            if (typeof basketDomHandler === 'object' && typeof basketDomHandler.processResponseSuccess === 'function') {
                basketDomHandler.processResponseSuccess(response);
            }
        }, (response) => {
            if (typeof basketDomHandler === 'object' && typeof basketDomHandler.processEnd === 'function') {
                basketDomHandler.processEnd();
            }
            if (typeof basketDomHandler === 'object' && typeof basketDomHandler.processResponseError === 'function') {
                basketDomHandler.processResponseError(response);
            }
        });
    }
}
