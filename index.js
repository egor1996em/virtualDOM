
var store = new VirtualDOMStore();

window.onload = function(){
    var parent = document.getElementById('app');
	
	var HelloWorldElement = new DOMelement('h1',[new Property('class','header'), new Property('id','hw')],['Hello world']);
	store.addDOMElement(HelloWorldElement);
    renderNode(parent, HelloWorldElement);
	
	var button = new DOMelement('button',[new Property('id','change_button')],['Change element']);
	button.setBeahaviour('click', function(){
		var UpdatedHelloWorld = new DOMelement('h4',[new Property('class','header'), new Property('id','hw')],['Hello virtualDOM']);
		updateElementInDOM(parent, store.getDOMelementsById('hw'),UpdatedHelloWorld, getIndexInParentCollection('hw'));
	})
	store.addDOMElement(button);
	renderNode(parent, button);
}

function DOMelement(type, props, children){
    this.type = type
    this.props = props
    this.children = children
	
	this.Behaviour = []
}

DOMelement.prototype.setBeahaviour = function(event, behaviour){
	this.Behaviour.push(new Behaviour(event, behaviour));
}

DOMelement.prototype.getPropertiesByName = function(name){
	return this.props.filter(function(element){
		return element.name === name
	})
}

function Property(name, value){
    this.name = name
    this.value = value
}

function Behaviour(event, behaviour){
	this.event = event;
	this.behaviour = behaviour;
}

function VirtualDOMStore(){
	this.virtualDOMElements = [];
}

VirtualDOMStore.prototype.addDOMElement = function(DOMelement){
	this.virtualDOMElements.push(DOMelement);
}

VirtualDOMStore.prototype.getDOMelementsById = function(idValue) {
	var element = null;
	for(var i = 0 ; i < this.virtualDOMElements.length ; i++){
		var properties = this.virtualDOMElements[i].getPropertiesByName('id');
		if(properties[0].value === idValue){
			element = this.virtualDOMElements[i];
			break;
		}
	}
	
	if(element === null){
		this.getDOMelementsById(idValue);
	}
	return element;
}

function renderNode(parent, node){
    var element = createElementInDOM(node);
	node.Behaviour.forEach(function(item, index, arr){
		element.addEventListener(item.event, item.behaviour);
	});
    parent.appendChild(element);
}

function removeChildNode(parent){
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

function createElementInDOM(node){
    
    var element;
    
    if(typeof node !== 'string'){
        element = document.createElement(node.type);
        node.props.forEach(function(item, index, arr){
       element.setAttribute(item.name, item.value);})
						   
        if(node.children.length > 0){
            node.children.forEach(function(item, index, arr){
               element.appendChild(createElementInDOM(item)); 
            });
        }
    } else {
        element = document.createTextNode(node)
    }
    
    return element;
}

function updateElementInDOM(parent, oldNode, newNode, index){
    if(!oldNode) {
        renderNode(parent, newNode);
    } else if(!newNode){
        removeChildNode(parent)
    } else if(isChanged(oldNode, newNode)){
        parent.replaceChild(createElementInDOM(newNode), parent.childNodes[index]);
    } else if(newNode.type){
        var oldNodeChildrenLength = oldNode.children.length;
        var newNodeChildrenLength = newNode.children.length;
        
        for(var i = 0 ; i < oldNodeChildrenLength || i < newNodeChildrenLength; i++){
            updateElementInDOM(parent.childNodes[index], newNode.children[i], oldNode.children[i], i)
        }
    }
}

function isChanged(oldNode, newNode){
    return typeof oldNode !== typeof newNode || (typeof oldNode === 'string' && oldNode !== newNode) || oldNode.type !== newNode.type;
}

function getIndexInParentCollection(elementId){
	var element = document.getElementById(elementId);
	var parent = element.parentElement;
	var index;
	for (var i = 0; i < parent.children.length; i++){
		if(parent.children[i] == element){
			index = i;
			break;
		}
	}
	return index;
}