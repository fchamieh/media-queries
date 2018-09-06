# media-queries
An attempt to provide Material Design (AngularJS Material)-like layout by flex attribute support and Media Queries for responsive styles.

## Usage
Include both JS and CSS in your HTML page, then you can use them as follows

### FlexBox Response Layout

```
<div layout="row" layout-xs="column" layout-align-gt-xs="center" cross-layout-align-xs="center">
	<div>I am Child 1</div>
	<div>I am Child 2</div>
	<div>I am Child 3</div>
</div>
```

Hiding and showing elements based on screen size

```
<div hide-xs>This will only show on screens larger than 480px in width</div>
<div hide-gt-xs>This will only show on small screens smaller than 480px in width</div>
```

### Using shortcut size related media-query classes in CSS
```
.mq-xs .appliesOnlyOnMobile {
    font-size: 80%;
}
```

## Contributions
I welcome your feedback and contributions and please forgive the lack of usage examples. I will add a sample HTML with extensive examples in the future (in-sha-Allah).
