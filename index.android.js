import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  requireNativeComponent,
  View,
  StyleSheet,
} from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

const {
  NativeModules: { UIManager, CrosswalkWebViewManager: { JSNavigationScheme } },
} = ReactNative;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const WEBVIEW_REF = 'crosswalkWebView';

class WebView extends PureComponent {
  constructor(props) {
    super(props);
    this.statics = JSNavigationScheme;
    this.onProgress = this.onProgress.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  onNavigationStateChange(event) {
    const { onNavigationStateChange } = this.props;
    if (onNavigationStateChange) {
      onNavigationStateChange(event.nativeEvent);
    }
  }

  onError(event) {
    const { onError } = this.props;
    if (onError) {
      onError(event.nativeEvent);
    }
  }

  onProgress(event) {
    const { onProgress } = this.props;
    if (onProgress) {
      onProgress(event.nativeEvent.progress / 100);
    }
  }

  onMessage(event) {
    const { onMessage } = this.props;
    if (onMessage) {
      onMessage(event);
    }
  }

  getWebViewHandle() {
    // eslint-disable-next-line react/no-string-refs
    return ReactNative.findNodeHandle(this.refs[WEBVIEW_REF]);
  }

  goBack() {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.goBack,
      null,
    );
  }

  goForward() {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.goForward,
      null,
    );
  }

  reload() {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.reload,
      null,
    );
  }

  postMessage(data) {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.CrosswalkWebView.Commands.postMessage,
      [String(data)],
    );
  }

  render() {
    const source = this.props.source || {};
    if (this.props.url) {
      source.uri = this.props.url;
    }

    return (
      <View style={styles.container}>
        <NativeCrosswalkWebView
          ref={WEBVIEW_REF}
          style={[styles.container, this.props.style]}
          injectedJavaScript={this.props.injectedJavaScript}
          onMessage={this.props.onMessage}
          messagingEnabled={typeof this.props.onMessage === 'function'}
          onCrosswalkWebViewNavigationStateChange={this.onNavigationStateChange}
          onCrosswalkWebViewError={this.onError}
          onCrosswalkWebViewProgress={this.onProgress}
          source={resolveAssetSource(source)}
        />
      </View>
    );
  }
}

WebView.propTypes = {
  injectedJavaScript: PropTypes.string,
  localhost: PropTypes.bool,
  onError: PropTypes.func,
  onMessage: PropTypes.func,
  onNavigationStateChange: PropTypes.func,
  onProgress: PropTypes.func,
  source: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string, // URI to load in WebView
    }),
    PropTypes.shape({
      html: PropTypes.string, // static HTML to load in WebView
    }),
    PropTypes.number, // used internally by React packager
  ]).isRequired,
  url: PropTypes.string,
  ...View.propTypes,
};

WebView.defaultProps = {
  injectedJavaScript: '',
  localhost: false,
  onError: () => {},
  onMessage: () => {},
  onNavigationStateChange: () => {},
  onProgress: () => {},
  url: null,
};

const NativeCrosswalkWebView = requireNativeComponent(
  'CrosswalkWebView',
  WebView,
  {
    nativeOnly: {
      messagingEnabled: PropTypes.bool,
    },
  },
);

export default WebView;
