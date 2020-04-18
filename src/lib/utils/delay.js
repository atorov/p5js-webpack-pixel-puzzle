function delay(t = 1) {
    return new Promise((resolve) => setTimeout(resolve, t))
}

export default delay
