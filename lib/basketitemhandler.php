<?php


namespace WC\Sale;


use Bitrix\Main\Loader;
use WC\Main\Messages;
use WC\Main\Result;

class BasketItemHandler
{
    /**
     * @var BasketItem $basketItem
     * @var Basket $basket
     */
    public $basketItem;
    public $basket;
    public $productProviderClass = \CCatalogProductProvider::class;

    public function __construct(BasketItem $basketItem)
    {
        $this->result = new Result();
        $this->mess = new Messages(__FILE__);

        $this->basket = $basketItem->getCollection();
        $this->basketItem = $basketItem;
        $this->basketItem->setField('PRODUCT_PROVIDER_CLASS', $this->productProviderClass);
    }

    public function process($action, $quantity = null)
    {
        /** @var \Bitrix\Main\Result $r */

        $quantity = $quantity ?: $this->basketItem->mathQuantity($action);
        $this->quantity = $this->basketItem->checkQuantity($quantity);

        if ($this->quantity > 0) {
            if ($this->basketItem->getId() == null) {
                $this->add();
            } else {
                $this->update();
            }
        } else {
            $this->delete();
        }

        $r = $this->basket->save();

        $this->result->mergeResult($r);

        return $this->result;
    }

    protected function add()
    {
        $this->basketItem->setQuantity($this->quantity);

        $fields = $this->basketItem->prepareBasketItemFields();
        $this->basketItem->setFields($fields);

        $this->basketItem->setPriceName();

        $this->basketItem->setPropertyArticle();
    }

    protected function update()
    {
        /** @var \CCatalogProductProvider $productProvider */
        /*$this->productProvider = $this->basketItem->getProvider();
        $productProviderFields = $this->productProviderClass::GetProductData(['PRODUCT_ID' => $this->basketItem->getProductId()]);
        $this->basketItem->setFields($productProviderFields);*/

        $this->basketItem->setQuantity($this->quantity);
    }

    protected function delete()
    {
        $this->basketItem->delete();
    }

    /**
     * @param $productId
     * @param Basket|null $basket
     * @return BasketItem|null
     */
    public static function getBasketItem($productId, Basket $basket = null): ?BasketItem
    {
        Loader::includeModule('catalog');
        $basket = $basket ?: BasketHandler::getCurrentUserBasket();
        if (\Bitrix\Catalog\ProductTable::getById($productId)->fetch()) {
            return $basket->getItemBy(['PRODUCT_ID' => $productId]) ?: $basket->createItem('catalog', $productId);
        }

        return null;
    }
}