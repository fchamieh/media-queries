# media-queries
An attempt to provide [AngularJS Material Design](https://material.angularjs.org/latest/) layout by [flex](https://material.angularjs.org/latest/layout/introduction) attribute support and Media Queries for responsive styles.

Works with all modern browsers (tested on Chrome, Firefox, Safari, Edge), and IE 10/11.

## Usage
Include both JS and CSS in your HTML page, then you can use them as follows

### FlexBox responsive layout

```HTML
<div layout="row" layout-xs="column" layout-align-gt-xs="center" cross-layout-align-xs="center">
	<div>I am Child 1</div>
	<div>I am Child 2</div>
	<div>I am Child 3</div>
</div>
```

Hiding and showing elements based on screen size

```HTML
<div hide-xs>This will only show on screens larger than 480px in width</div>
<div hide-gt-xs>This will only show on small screens smaller than 480px in width</div>
```

### Using shortcut size related media-query classes in CSS

```CSS
.mq-xs .appliesOnlyOnMobile {
    font-size: 80%;
}
```

## Contributions
I welcome your feedback and contributions and please forgive the lack of usage examples. I will add a sample HTML with extensive examples in the future (in-sha-Allah).
