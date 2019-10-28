import React from 'react';

export default class SingleProductVariations extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            attributes: [],
            options: [],
            filters: [],
            matches: []
        }

        this.variations = this.props.variations;
        this.attributes = this.props.attributes;
        this.onMatchFound = this.props.onMatchFound;
    }

    componentDidMount() {
        this.getAttributes();
    }

    getAttributes = () => {
        let newAttributes = [];
        let newOptions = [];
        this.variations.map(variation => {
            variation.attributes.map(variation_attribute => {
                //CHECK IF ATTRIBUTE EXISTS
                const attributes = newAttributes.filter(attribute => variation_attribute.name == attribute);
                if (attributes.length == 0) {
                    newAttributes.push(variation_attribute.name);
                }
                //CHECK IF OPTION EXISTS
                const options = newOptions.filter(option => {
                    if (option.key == variation_attribute.name) {
                        return option.value == variation_attribute.option;
                    }
                })
                if (options.length == 0) {
                    newOptions.push({ key: variation_attribute.name, value: variation_attribute.option })
                }
            })
        })

        this.setState({ attributes: newAttributes })
        this.setState({ options: newOptions })
    }

    onVariationChange = (key, value) => {
        var newFilters = []

        if (this.state.filters.length > 0 && this.state.matches.filter(match => match == value).length == 0) {
            newFilters = []
        }
        else if (!(this.state.filters.length > 0 && this.state.filters[0].key == key)) {
            newFilters = this.state.filters.filter(filter => filter.key !== key)
        }
        
        newFilters = [{key,value}, ...newFilters];
        this.setState({
            filters: newFilters
        }, () => {
            // CHECK IF WE FOUND A VARIATION
            this.findVariationWithFilters();
            this.updateVariationMatches();
            // console.log(this.state.filters)
        })
    }

    updateVariationMatches = () => {
        var newMatches = []
        this.state.filters.map(filter => {
            this.variations.map(variation => {
                variation.attributes.map(attribute => {
                    if (attribute.name == filter.key && attribute.option == filter.value) {
                        variation.attributes.map(vattribute => {
                            newMatches.push(vattribute.option);
                        })
                    }
                })
            })
        })

        this.setState({ matches: newMatches }, () => {
            // console.log(this.state.matches)
        })
    }

    findVariationWithFilters = () => {
        this.onMatchFound(null)
        if (this.state.filters.length == this.state.attributes.length) {

            const variations = this.variations.filter(variation => {
                return variation.attributes.filter(attribute =>
                    this.state.filters.filter(filter => attribute.name == filter.key && attribute.option == filter.value).length >= 1).length >=
                    this.state.filters.length
            })
            if (variations.length > 0) this.onMatchFound(variations[0])
        }
    }

    findImageWithColor = (color) => {
        const variations = this.variations.filter(variation => {
            return variation.attributes.filter(attribute => attribute.option == color).length > 0
        })
        if (variations.length > 0) {
            if (variations[0].image != null) {
                return variations[0].image.src;
            }
        }
        return undefined;
    }

    render() {
        const { attributes, options, filters, matches } = this.state;
        return (
            <div>
                <div className="item__variations variation__table">
                    {attributes.map(attribute => {
                        return (
                            <div style={{ paddingBottom: 20 }}>
                                <h4>{attribute}</h4>

                                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>

                                    {options.map(option => {
                                        if (option.key == attribute) {

                                            const isDisable = () => {
                                                if (filters.length == 1 && filters[0].key == option.key) return false;
                                                if (filters.length > 0 && matches.filter(match => match == option.value).length > 0) {
                                                    return false;
                                                }
                                                if (filters.length == 0) return false;
                                                return true;
                                            }

                                            const isSelected = () => {
                                                if (filters.length > 0 &&
                                                    filters.filter(filter => filter.key == option.key
                                                        && filter.value == option.value).length > 0) return true;
                                                return false;
                                            }
                                            // HERE WE RENDER EACH OPTION FOR THE ATTRIBUTES
                                            return <div style={{ display: 'flex', flexDirection: 'column' }}>

                                                {option.key == 'Color' && (
                                                    <div style={
                                                        isDisable() ? styles.colorAttributeDisable :
                                                            isSelected() ? styles.colorAttributeSelected : styles.colorAttributeEnable
                                                    }
                                                        onClick={(e) => {
                                                            this.onVariationChange(option.key, option.value)
                                                        }}>
                                                        <img src={this.findImageWithColor(option.value)}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                )}
                                                {option.key != 'Color' && (
                                                    <div style={
                                                        isDisable() ? styles.restAttributesDisable :
                                                            isSelected() ? styles.restAttributesSelected : styles.restAttributesEnable
                                                    } onClick={(e) => {
                                                        this.onVariationChange(option.key, option.value)
                                                    }}>
                                                        <a>{option.value}</a>
                                                    </div>
                                                )}

                                            </div>
                                        }
                                    })}
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

const styles = {
    colorAttributeEnable: {
        width: 50,
        height: 50,
        marginRight: 10,
        cursor: 'pointer'
    },
    colorAttributeDisable: {
        // pointerEvents: 'none',
        width: 50,
        height: 50,
        marginRight: 10,
        opacity: 0.5
    },
    colorAttributeSelected: {
        width: 50,
        height: 50,
        marginRight: 10,
        cursor: 'pointer',
        border: '2px solid orange'
    },
    restAttributesEnable: {
        width: 40, height: 40, border: '1px solid black', marginRight: 10,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        cursor: 'pointer'
    },
    restAttributesDisable: {
        // pointerEvents: 'none',
        width: 40, height: 40, border: '1px solid black', marginRight: 10,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        cursor: 'pointer',
        opacity: 0.5
    },
    restAttributesSelected: {
        width: 40, height: 40, border: '1px solid black', marginRight: 10,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        cursor: 'pointer',
        border: '2px solid orange'
    }
}